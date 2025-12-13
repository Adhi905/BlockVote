// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    address public owner;
    uint256 public nextElectionId;

    struct Election {
        uint256 id;
        uint256 candidateCount;
        bool ended;
        uint256 createdAt;
    }

    // --- EVENTS (added/ensured) ---
    event ElectionCreated(uint256 indexed electionId, uint256 candidateCount, address indexed creator);
    event Voted(uint256 indexed electionId, uint256 indexed candidateIndex, address indexed voter);
    event ElectionEnded(uint256 indexed electionId, address indexed endedBy);

    // electionId => candidateIndex => votes
    mapping(uint256 => mapping(uint256 => uint256)) private votes;
    // electionId => voter => bool
    mapping(uint256 => mapping(address => bool)) private hasVoted;
    // election metadata
    mapping(uint256 => Election) public elections;

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextElectionId = 1;
    }

    // create election with number of candidates
    // create election with number of candidates
    function createElection(uint256 candidateCount) external onlyOwner returns (uint256) {
        require(candidateCount > 1, "need at least 2 candidates");
        uint256 eid = nextElectionId++;
        elections[eid] = Election({id: eid, candidateCount: candidateCount, ended: false, createdAt: block.timestamp});

        // IMPORTANT: emit the event with exactly these types and order
        emit ElectionCreated(eid, candidateCount, msg.sender);

        return eid;
    }

    function vote(uint256 electionId, uint256 candidateIndex) external {
        Election storage e = elections[electionId];
        require(e.id != 0, "election not found");
        require(!e.ended, "election ended");
        require(candidateIndex < e.candidateCount, "invalid candidate");
        require(!hasVoted[electionId][msg.sender], "already voted");
        votes[electionId][candidateIndex] += 1;
        hasVoted[electionId][msg.sender] = true;
        emit Voted(electionId, candidateIndex, msg.sender);
    }

    function endElection(uint256 electionId) external onlyOwner {
        Election storage e = elections[electionId];
        require(e.id != 0, "not found");
        require(!e.ended, "already ended");
        e.ended = true;
        emit ElectionEnded(electionId, msg.sender);
    }

    // view votes for each candidate
    function getVotes(uint256 electionId) external view returns (uint256[] memory) {
        Election storage e = elections[electionId];
        require(e.id != 0, "not found");
        uint256 count = e.candidateCount;
        uint256[] memory out = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            out[i] = votes[electionId][i];
        }
        return out;
    }

    function hasVotedFor(uint256 electionId, address voter) external view returns (bool) {
        return hasVoted[electionId][voter];
    }
}