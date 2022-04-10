import { Card } from "antd";
import { useContractExistsAtAddress, useContractLoader } from "eth-hooks";
import React, { useMemo, useState } from "react";
import Address from "../Address";
import Balance from "../Balance";
import DisplayVariable from "./DisplayVariable";
import FunctionForm from "./FunctionForm";
import { Transactor } from "../../helpers";
import { Button } from "antd";

const { utils, BigNumber } = require("ethers");

const noContractDisplay = (
  <div>
    Loading...{" "}
    <div style={{ padding: 32 }}>
      You need to run{" "}
      <span
        className="highlight"
        style={{ marginLeft: 4, /* backgroundColor: "#f1f1f1", */ padding: 4, borderRadius: 4, fontWeight: "bolder" }}
      >
        yarn run chain
      </span>{" "}
      and{" "}
      <span
        className="highlight"
        style={{ marginLeft: 4, /* backgroundColor: "#f1f1f1", */ padding: 4, borderRadius: 4, fontWeight: "bolder" }}
      >
        yarn run deploy
      </span>{" "}
      to see your contract here.
    </div>
    <div style={{ padding: 32 }}>
      <span style={{ marginRight: 4 }} role="img" aria-label="warning">
        ☢️
      </span>
      Warning: You might need to run
      <span
        className="highlight"
        style={{ marginLeft: 4, /* backgroundColor: "#f1f1f1", */ padding: 4, borderRadius: 4, fontWeight: "bolder" }}
      >
        yarn run deploy
      </span>{" "}
      <i>again</i> after the frontend comes up!
    </div>
  </div>
);

const isQueryable = fn => (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;

export default function Contract({
  customContract,
  account,
  gasPrice,
  signer,
  provider,
  name,
  show,
  price,
  blockExplorer,
  chainId,
  contractConfig,
}) {
  const contracts = useContractLoader(provider, contractConfig, chainId);
  let contract;
  if (!customContract) {
    contract = contracts ? contracts[name] : "";
  } else {
    contract = customContract;
  }

  const address = contract ? contract.address : "";
  const contractIsDeployed = useContractExistsAtAddress(provider, address);

  const displayedContractFunctions = useMemo(() => {
    const results = contract
      ? Object.entries(contract.interface.functions).filter(
          fn => fn[1]["type"] === "function" && !(show && show.indexOf(fn[1]["name"]) < 0),
        )
      : [];
    return results;
  }, [contract, show]);

  const [refreshRequired, triggerRefresh] = useState(false);
  const contractDisplay = displayedContractFunctions.map(contractFuncInfo => {
    const contractFunc =
      contractFuncInfo[1].stateMutability === "view" || contractFuncInfo[1].stateMutability === "pure"
        ? contract[contractFuncInfo[0]]
        : contract.connect(signer)[contractFuncInfo[0]];

    if (typeof contractFunc === "function") {
      if (isQueryable(contractFuncInfo[1])) {
        // If there are no inputs, just display return value
        return (
          <DisplayVariable
            key={contractFuncInfo[1].name}
            contractFunction={contractFunc}
            functionInfo={contractFuncInfo[1]}
            refreshRequired={refreshRequired}
            triggerRefresh={triggerRefresh}
            blockExplorer={blockExplorer}
          />
        );
      }

      // If there are inputs, display a form to allow users to provide these
      return (
        <FunctionForm
          key={"FF" + contractFuncInfo[0]}
          contractFunction={contractFunc}
          functionInfo={contractFuncInfo[1]}
          provider={provider}
          gasPrice={gasPrice}
          triggerRefresh={triggerRefresh}
        />
      );
    }
    return null;
  });

  return (
    <div style={{ margin: "auto", width: "70vw" }}>
      <Card
        title={
          <div style={{ fontSize: 24 }}>
            {name}
            <div style={{ float: "right" }}>
              <Address value={address} />
              <Balance address={address} provider={provider} price={price} />
            </div>
          </div>
        }
        size="large"
        style={{ marginTop: 25, width: "100%" }}
        loading={contractDisplay && contractDisplay.length <= 0}
      >
        {contractIsDeployed ? contractDisplay : noContractDisplay}
      </Card>
    </div>
  );
}

const displayedContractFunctions = contract => {
  const results = contract
    ? Object.entries(contract.interface.functions).filter(fn => fn[1]["type"] === "function")
    : [];
  return results;
};

const contractDisplay = (contract, signer) => {
  const map = {};
  displayedContractFunctions(contract)
    .map(contractFuncInfo => {
      const contractFunc =
        contractFuncInfo[1].stateMutability === "view" || contractFuncInfo[1].stateMutability === "pure"
          ? contract[contractFuncInfo[0]]
          : contract.connect(signer)[contractFuncInfo[0]];

      return {
        info: contractFuncInfo[1],
        name: contractFuncInfo[1].name,
        func: contractFunc,
      };
    })
    .map(item => {
      map[item.name] = item;
    });
  return map;
};

export function Shop({ gasPrice, signer, provider, chainId, contractConfig }) {
  const contracts = useContractLoader(provider, contractConfig, chainId);
  const erc20 = {
    contract: contracts["USDCx"],
    isDeployed: false,
    funcs: {},
  };
  const main = {
    contract: contracts["YourContract"],
    isDeployed: false,
    funcs: {},
  };

  erc20.isDeployed = useContractExistsAtAddress(provider, erc20?.contract?.address || "");
  main.isDeployed = useContractExistsAtAddress(provider, main?.contract?.address || "");

  main.funcs = useMemo(() => {
    return contractDisplay(main.contract, signer);
  }, [main, signer]);

  erc20.funcs = useMemo(() => {
    return contractDisplay(erc20.contract, signer);
  }, [erc20, signer]);

  const tx = Transactor(provider, gasPrice);

  if (
    Object.keys(main.funcs).length === 0 ||
    Object.keys(erc20.funcs).length === 0 ||
    !erc20.isDeployed ||
    !main.isDeployed
  ) {
    return null;
  }
  return (
    <div style={{ margin: "auto", width: "70vw" }}>
      <img src="https://i.imgur.com/FShshnC.jpeg" width={300} />
      <div>Price: 1 USDCx</div>
      <Button
        key="buybtn"
        shape="round"
        size="large"
        onClick={() => {
          const amount = utils.parseEther("1");
          tx(erc20.funcs.approve.func(...[main.contract.address, amount]))
            .then(() => tx(main.funcs.buyItem.func(...[amount])))
            .catch(e => console.error(e));
        }}
      >
        buy
      </Button>
      {/* <FunctionForm
        key={"approve"}
        contractFunction={erc20.funcs.approve.func}
        functionInfo={erc20.funcs.approve.info}
        provider={provider}
        gasPrice={gasPrice}
        triggerRefresh={() => {}}
      /> */}
      {/* <FunctionForm
        key={"buy"}
        contractFunction={main.funcs.buyItem.func}
        functionInfo={main.funcs.buyItem.info}
        provider={provider}
        gasPrice={gasPrice}
        triggerRefresh={() => {}}
      /> */}
    </div>
  );
}
