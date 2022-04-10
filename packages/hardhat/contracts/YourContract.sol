pragma solidity 0.8.13;
//SPDX-License-Identifier: MIT

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

import {ISuperfluid, ISuperToken, ISuperApp, ISuperAgreement, SuperAppDefinitions} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol"; //"@superfluid-finance/ethereum-monorepo/packages/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    IDAv1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/IDAv1Library.sol";

import {IInstantDistributionAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";

contract YourContract is ERC721 {

    using SafeCast for uint256;

    // superfluid
    using IDAv1Library for IDAv1Library.InitData;
    IDAv1Library.InitData private _idaLib;
    ISuperfluid private _host; // host
    IInstantDistributionAgreementV1 private _cfa;
    ISuperToken private _acceptedToken;

    // other
    IERC20 private _token;
    uint256 public _totalRevenue;
    uint256 private _tokenIdCounter; // nft ids
    uint256 public _cashBackPercentage;
    uint32 public _indexId;

    mapping(address => NftMetadata) private _mappingNftMeta;

    struct NftMetadata {
        uint32 indexId;
        uint256 revenue;
    }

   constructor(
        ISuperfluid host,
        ISuperToken acceptedToken
    ) ERC721("test", "test") {
        assert(address(host) != address(0));
        assert(address(acceptedToken) != address(0));

        // init supersluid
        _indexId = 1;
        _host = host;
        _cfa = IInstantDistributionAgreementV1(
            address(
                host.getAgreementClass(
                    keccak256(
                        "org.superfluid-finance.agreements.InstantDistributionAgreement.v1"
                    )
                )
            )
        );
        _idaLib = IDAv1Library.InitData(_host, _cfa);
        _idaLib.createIndex(acceptedToken, _indexId);

        // erc20
        _token = IERC20(acceptedToken);

        // assign vars
        _acceptedToken = acceptedToken;
        _totalRevenue = 0;
        _tokenIdCounter = 0;
        _cashBackPercentage = 10;
    }

  function buyItem(uint256 amount) public {

     // move tokens to the contract
     _token.transferFrom(msg.sender, address(this), amount);

    // increase total revenue
    _totalRevenue += amount;

    // mint nft maybe
    if (ERC721.balanceOf(msg.sender) == 0) {
        // nft
        _tokenIdCounter += 1;
        ERC721._safeMint(msg.sender, _tokenIdCounter);

        // set nft metadata
        _mappingNftMeta[msg.sender].revenue = amount;
    } else {
        _mappingNftMeta[msg.sender].revenue += amount;
    }

    // distribute
    _idaLib.updateSubscriptionUnits(_acceptedToken, _indexId, msg.sender, (_mappingNftMeta[msg.sender].revenue/(1 ether)).toUint128());
    _idaLib.distribute(_acceptedToken, _indexId, SafeMath.mul(SafeMath.div(amount, 100), _cashBackPercentage));
  }

   // calculate cashbackamount
//   function cashBack(uint256 amount) public view returns (uint256) {
//     (,,totalUnitsApproved,totalUnitsPending) = _idaLib.getIndex(_acceptedToken, address(this), _indexId);
//     (,,units,) = _idaLib.getSubscription(_acceptedToken, address(this), _indexId, msg.sender);

//     uint128 totalUnits = SafeMath.add(totalUnitsApproved, totalUnitsPending);
//     uint128 sharePrecentage = SafeMath.div(SafeMath.mul(units, 100), totalUnits);
//     return 1;
//   }
}
