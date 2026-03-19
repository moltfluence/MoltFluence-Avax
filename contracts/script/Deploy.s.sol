// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {ContentAttestationSender} from "../ContentAttestationSender.sol";
import {ContentAttestationRegistry} from "../ContentAttestationRegistry.sol";

/**
 * Deploy both Teleporter attestation contracts on Avalanche Fuji C-Chain.
 *
 * For the hackathon demo, both contracts are deployed on the same chain
 * (Fuji C-Chain) to prove the architecture works. In production, the
 * Registry would be deployed on a separate Avalanche L1.
 *
 * Usage:
 *   forge script script/Deploy.s.sol --rpc-url fuji --broadcast --private-key $AGENT_PRIVATE_KEY
 */
contract DeployAttestation is Script {
    // TeleporterMessenger — universal address on all Avalanche chains
    // Ref: https://build.avax.network/docs/cross-chain/teleporter/addresses
    address constant TELEPORTER = 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf;

    // Fuji C-Chain blockchain ID (bytes32)
    // This is the CB58-decoded blockchain ID for the Fuji C-Chain
    bytes32 constant FUJI_C_CHAIN_ID = 0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5;

    function run() external {
        uint256 deployerKey = vm.envUint("AGENT_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);

        vm.startBroadcast(deployerKey);

        // 1. Deploy Registry first (it will receive attestations)
        ContentAttestationRegistry registry = new ContentAttestationRegistry(
            TELEPORTER,
            FUJI_C_CHAIN_ID,    // source chain = Fuji C-Chain
            address(0)           // trustedSender — will be set after sender deploys
        );
        console.log("Registry deployed:", address(registry));

        // 2. Deploy Sender (sends attestations via Teleporter)
        ContentAttestationSender sender = new ContentAttestationSender(
            TELEPORTER,
            FUJI_C_CHAIN_ID,    // destination chain = same chain for demo
            address(registry)
        );
        console.log("Sender deployed:", address(sender));

        vm.stopBroadcast();

        console.log("");
        console.log("=== Add to .env ===");
        console.log(string.concat("ATTESTATION_SENDER_ADDRESS=", vm.toString(address(sender))));
        console.log(string.concat("ATTESTATION_REGISTRY_ADDRESS=", vm.toString(address(registry))));
        console.log(string.concat("ATTESTATION_DEST_BLOCKCHAIN_ID=", vm.toString(FUJI_C_CHAIN_ID)));
        console.log("ATTESTATION_DEST_RPC=https://api.avax-test.network/ext/bc/C/rpc");
    }
}
