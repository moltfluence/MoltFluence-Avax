// SPDX-License-Identifier: Ecosystem
// Reference: https://github.com/ava-labs/icm-contracts/blob/main/contracts/teleporter/ITeleporterMessenger.sol
pragma solidity ^0.8.18;

struct TeleporterFeeInfo {
    address feeTokenAddress;
    uint256 amount;
}

struct TeleporterMessageInput {
    bytes32 destinationBlockchainID;
    address destinationAddress;
    TeleporterFeeInfo feeInfo;
    uint256 requiredGasLimit;
    address[] allowedRelayerAddresses;
    bytes message;
}

interface ITeleporterMessenger {
    function sendCrossChainMessage(TeleporterMessageInput calldata messageInput)
        external
        returns (bytes32 messageID);

    function getNextMessageID(bytes32 destinationBlockchainID)
        external
        view
        returns (bytes32 messageID);
}
