pragma solidity 0.8.13;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

import {ISuperfluid, ISuperToken, ISuperApp, ISuperAgreement, SuperAppDefinitions} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol"; //"@superfluid-finance/ethereum-monorepo/packages/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    IDAv1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/IDAv1Library.sol";

import {IInstantDistributionAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";

contract YourContract {

  event SetPurpose(address sender, string purpose);

    using IDAv1Library for IDAv1Library.InitData;

    //initialize cfaV1 variable
    IDAv1Library.InitData private _idaLib;

    ISuperfluid private _host; // host
    IInstantDistributionAgreementV1 private _cfa;
    ISuperToken private _acceptedToken;
    uint32 private _indexId;

   constructor(
        ISuperfluid host,
        ISuperToken acceptedToken,
        uint32 indexId // create index for superfluid
    ) {
        assert(address(host) != address(0));
        assert(address(acceptedToken) != address(0));

        // init supersluid
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
        _idaLib.createIndex(acceptedToken, indexId);

        // assign vars
        _acceptedToken = acceptedToken;
        _indexId = indexId;
    }

  function buyItem(address subscriber, uint128 units, uint256 amount) public {
    _idaLib.updateSubscriptionUnits(_acceptedToken, _indexId, subscriber, units);
    _idaLib.distribute(_acceptedToken, _indexId, amount);
  }

    // total renvenu in store
    // mapping user => indexId
    // mapping user => revenu in store
    // mapping user => nft

    // one index per user
    // migrate subscription on nft transfers
}
