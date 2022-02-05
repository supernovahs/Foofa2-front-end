import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { useState } from "react";
import axios from "axios";
import { useBalance, useContractLoader, useGasPrice, useOnBlock, useUserProviderAndSigner } from "eth-hooks";
import LocaleProvider from "antd/lib/locale-provider";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 */
function Home2({
  yourLocalBalance,
  readContracts,
  address,
  writeContracts,
  localProvider,
  imgs,
  setImgs,
  setSelectedNft,
  selectedNft,
  tx,
  address2,
}) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const purpose = useContractReader(readContracts, "YourContract", "purpose");

  useEffect(() => {
    const url = `https://api.covalenthq.com/v1/42/address/${address}/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=false&key=ckey_1d7288b1bd29481ba9c8415d038`;
    const fun = async () => {
      let data = [];
      let images = [];
      try {
        data = await axios.get(url);
        for (const item of data?.data?.data?.items) {
          console.log(item);
          if (item?.supports_erc?.includes("erc1155") && item?.nft_data !== null) {
            for (const nft of item.nft_data) {
              const img_data = await axios.get(nft.token_url);
              console.log(img_data);
              images.push({
                token_id: nft.token_id,
                token_balance: nft.token_balance,
                name: img_data.data.name,
                image_url: img_data.data.image,
                contract_address: item.contract_address,
              });
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
      console.log(images);
      let fimages = [];
      for (const nft of images) {
        const listingmapping = await tx(readContracts.FooFa.ListingDetails(nft.contract_address, nft.token_id));
        const seller = listingmapping[1];
        console.log(seller);
        console.log(address2);
        if (seller === address2) {
          fimages.push(nft);
        }
      }
      //   images = images.filter(async img => {
      //     console.log(img.contract_address);
      //     console.log(img.token_id);
      //     const listingmapping = await tx(readContracts.FooFa.ListingDetails(img.contract_address, img.token_id));
      //     const seller = listingmapping[1];
      //     console.log(seller);
      //     console.log(address2);
      //     if (seller === address2) return true;
      //     else return false;
      //   });
      setImgs(fimages);
    };
    fun();
  }, [address, selectedNft]);

  return (
    <div>
      {imgs.map(img => (
        <div key={img.token_id} onClick={() => setSelectedNft(img)}>
          <img src={img.image_url} alt={img.name} srcset="" />
          <span>{img.name}</span>
        </div>
      ))}
    </div>
  );
}

export default Home2;
