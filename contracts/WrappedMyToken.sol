// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {MyToken} from "./MyToken.sol";

contract WrappedMyToken is MyToken {
    constructor(
        string memory TokenName,
        string memory TokenSymbol
    ) MyToken(TokenName, TokenName) {}

    function mintTokenWithSpecificTokenId(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }
}
