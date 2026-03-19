// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITeleporterMessenger, TeleporterMessageInput, TeleporterFeeInfo} from "./interfaces/ITeleporterMessenger.sol";

/**
 * @title ContentAttestationSender
 * @notice Sends content attestations from C-Chain to a registry on another Avalanche L1
 *         via Teleporter (Avalanche Interchain Messaging).
 *
 * After an x402-paid video generation, the Moltfluence backend calls `attest()` to create
 * a cross-chain verifiable proof of content generation. Any L1 in the Avalanche ecosystem
 * can then verify the attestation via the ContentAttestationRegistry on the destination chain.
 *
 * Ref: https://build.avax.network/docs/cross-chain/teleporter/overview
 * TeleporterMessenger on all chains: 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf
 */
contract ContentAttestationSender {
    // ── Teleporter ──────────────────────────────────────────────────────
    ITeleporterMessenger public immutable teleporter;

    // ── Destination (ContentAttestationRegistry on another L1) ────────
    bytes32 public immutable destinationBlockchainID;
    address public immutable registryAddress;

    // ── State ────────────────────────────────────────────────────────────
    address public owner;
    uint256 public attestationCount;
    uint256 public constant REQUIRED_GAS_LIMIT = 250_000;

    // ── Events ───────────────────────────────────────────────────────────
    event AttestationSent(
        bytes32 indexed messageID,
        bytes32 indexed contentHash,
        address indexed payer,
        uint256 amountUsdc,
        uint256 timestamp
    );

    // ── Errors ───────────────────────────────────────────────────────────
    error OnlyOwner();
    error ZeroContentHash();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    /**
     * @param _teleporter TeleporterMessenger address (0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf)
     * @param _destinationBlockchainID bytes32 blockchain ID of the destination L1
     * @param _registryAddress ContentAttestationRegistry address on the destination L1
     */
    constructor(
        address _teleporter,
        bytes32 _destinationBlockchainID,
        address _registryAddress
    ) {
        teleporter = ITeleporterMessenger(_teleporter);
        destinationBlockchainID = _destinationBlockchainID;
        registryAddress = _registryAddress;
        owner = msg.sender;
    }

    /**
     * @notice Send a content attestation cross-chain via Teleporter.
     * @param contentHash  keccak256(abi.encodePacked(prompt, videoUrl, characterId))
     * @param payer        Address that paid via x402 ERC-3009
     * @param amountUsdc   USDC amount in 6-decimal units
     * @param model        Generation model used (e.g. "ltx-2-fast")
     * @param metadataUri  IPFS or HTTP URI pointing to full generation metadata
     * @return messageID   Teleporter message ID for tracking
     */
    function attest(
        bytes32 contentHash,
        address payer,
        uint256 amountUsdc,
        string calldata model,
        string calldata metadataUri
    ) external onlyOwner returns (bytes32 messageID) {
        if (contentHash == bytes32(0)) revert ZeroContentHash();

        // ABI-encode the attestation payload for the receiver
        bytes memory payload = abi.encode(
            contentHash,
            payer,
            amountUsdc,
            block.timestamp,
            block.chainid,
            model,
            metadataUri
        );

        // Send via Teleporter — no fee (relayer runs for free on testnet)
        messageID = teleporter.sendCrossChainMessage(
            TeleporterMessageInput({
                destinationBlockchainID: destinationBlockchainID,
                destinationAddress: registryAddress,
                feeInfo: TeleporterFeeInfo({
                    feeTokenAddress: address(0),
                    amount: 0
                }),
                requiredGasLimit: REQUIRED_GAS_LIMIT,
                allowedRelayerAddresses: new address[](0),
                message: payload
            })
        );

        attestationCount++;

        emit AttestationSent(
            messageID,
            contentHash,
            payer,
            amountUsdc,
            block.timestamp
        );
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
