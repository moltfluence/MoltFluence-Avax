// SPDX-License-Identifier: Ecosystem
// Reference: https://github.com/ava-labs/icm-contracts/blob/main/contracts/teleporter/ITeleporterReceiver.sol
pragma solidity ^0.8.18;

interface ITeleporterReceiver {
    function receiveTeleporterMessage(
        bytes32 sourceBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external;
}
