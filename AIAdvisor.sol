// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AIAdvisor {
    struct AdviceRecord {
        address user;
        string prompt;
        string response;
        uint256 timestamp;
    }

    AdviceRecord[] public adviceLogs;

    event AdviceLogged(address indexed user, string prompt, string response, uint256 timestamp);

    function logAdvice(string memory _prompt, string memory _response) public {
        adviceLogs.push(AdviceRecord(msg.sender, _prompt, _response, block.timestamp));
        emit AdviceLogged(msg.sender, _prompt, _response, block.timestamp);
    }

    function getAdviceCount() public view returns (uint256) {
        return adviceLogs.length;
    }
}