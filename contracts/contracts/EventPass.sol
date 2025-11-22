// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventPass is ERC1155, Ownable {
    uint256 public constant REGISTRATION_PASS = 1;
    uint256 public constant EVENT_TICKET = 2;
    uint256 public constant EVENT_POAP = 3;

    constructor() ERC1155("https://example.com/metadata/{id}.json") Ownable(msg.sender) {}

    function mintRegistration(address to) external onlyOwner {
        _mint(to, REGISTRATION_PASS, 1, "");
    }

    function mintTicket(address to) external onlyOwner {
        _mint(to, EVENT_TICKET, 1, "");
    }

    function mintPOAP(address to) external onlyOwner {
        _mint(to, EVENT_POAP, 1, "");
    }
}

