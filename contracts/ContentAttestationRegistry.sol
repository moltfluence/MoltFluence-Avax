// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITeleporterReceiver} from "./interfaces/ITeleporterReceiver.sol";

/**
 * @title ContentAttestationRegistry
 * @notice Receives and stores content attestations from C-Chain via Teleporter.
 *         Deployed on a destination Avalanche L1 to serve as the cross-chain
 *         content provenance registry.
 *
 * Any contract or off-chain client on this L1 (or any L1 that can read this chain)
 * can verify that a specific piece of content was generated and paid for.
 *
 * Ref: https://build.avax.network/docs/cross-chain/teleporter/overview
 * TeleporterMessenger on all chains: 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf
 */
contract ContentAttestationRegistry is ITeleporterReceiver {
    // ── Teleporter ──────────────────────────────────────────────────────
    address public immutable teleporter;

    // ── Trusted source (ContentAttestationSender on C-Chain) ──────────
    bytes32 public immutable sourceBlockchainID;
    address public immutable trustedSender;

    // ── Attestation record ──────────────────────────────────────────────
    struct Attestation {
        address payer;
        uint256 amountUsdc;
        uint256 timestamp;
        uint256 originChainId;
        string model;
        string metadataUri;
        uint256 receivedAt;
    }

    // contentHash => Attestation
    mapping(bytes32 => Attestation) public attestations;

    // All content hashes for enumeration
    bytes32[] public contentHashes;

    // ── Events ───────────────────────────────────────────────────────────
    event AttestationReceived(
        bytes32 indexed contentHash,
        address indexed payer,
        uint256 amountUsdc,
        uint256 originTimestamp,
        string model
    );

    // ── Errors ───────────────────────────────────────────────────────────
    error UnauthorizedCaller();
    error UnauthorizedSource();
    error AttestationAlreadyExists();

    /**
     * @param _teleporter       TeleporterMessenger address on this L1
     * @param _sourceBlockchainID  bytes32 blockchain ID of the C-Chain (origin)
     * @param _trustedSender    ContentAttestationSender address on C-Chain
     */
    constructor(
        address _teleporter,
        bytes32 _sourceBlockchainID,
        address _trustedSender
    ) {
        teleporter = _teleporter;
        sourceBlockchainID = _sourceBlockchainID;
        trustedSender = _trustedSender;
    }

    /**
     * @notice Called by TeleporterMessenger when a cross-chain message arrives.
     *         Decodes and stores the content attestation.
     */
    function receiveTeleporterMessage(
        bytes32 _sourceBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external override {
        // Only TeleporterMessenger can call this
        if (msg.sender != teleporter) revert UnauthorizedCaller();
        // Only accept from our trusted sender on the expected source chain
        if (_sourceBlockchainID != sourceBlockchainID) revert UnauthorizedSource();
        if (originSenderAddress != trustedSender) revert UnauthorizedSource();

        // Decode the attestation payload
        (
            bytes32 contentHash,
            address payer,
            uint256 amountUsdc,
            uint256 timestamp,
            uint256 originChainId,
            string memory model,
            string memory metadataUri
        ) = abi.decode(message, (bytes32, address, uint256, uint256, uint256, string, string));

        // Prevent duplicate attestations
        if (attestations[contentHash].timestamp != 0) revert AttestationAlreadyExists();

        attestations[contentHash] = Attestation({
            payer: payer,
            amountUsdc: amountUsdc,
            timestamp: timestamp,
            originChainId: originChainId,
            model: model,
            metadataUri: metadataUri,
            receivedAt: block.timestamp
        });

        contentHashes.push(contentHash);

        emit AttestationReceived(
            contentHash,
            payer,
            amountUsdc,
            timestamp,
            model
        );
    }

    // ── Read functions ──────────────────────────────────────────────────

    /// @notice Check if content has a valid attestation
    function isAttested(bytes32 contentHash) external view returns (bool) {
        return attestations[contentHash].timestamp != 0;
    }

    /// @notice Get full attestation details for a content hash
    function getAttestation(bytes32 contentHash)
        external
        view
        returns (Attestation memory)
    {
        return attestations[contentHash];
    }

    /// @notice Total number of attestations received
    function totalAttestations() external view returns (uint256) {
        return contentHashes.length;
    }
}
