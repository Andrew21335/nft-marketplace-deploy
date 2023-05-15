import { v4 as uuidv4 } from "uuid";
import { Session } from "next-iron-session";
import { NextApiRequest, NextApiResponse } from "next";
import { withSession, contractAddress, addressCheckMiddleware, pinataApiKey, pinataSecretApiKey } from "./utils";
import { NftMeta } from "@_types/nft";
import axios from "axios";

export default withSession(async (req: NextApiRequest & {session: Session}, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const {body} = req;
      const nft = body.nft as NftMeta
      
      if (!nft.name || !nft.description || !nft.attributes) {
        return res.status(422).send({message: "Some of the form data are missing!"}); 
      }

      await addressCheckMiddleware(req, res);
      var axios = require('axios');
        var data = JSON.stringify({
          pinataMetadata: {
            name: uuidv4()
          },
          pinataContent: nft
        });

        var config = {
          method: 'post',
          url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
          headers: {
            'Accept': 'text/plain',
            'Content-Type': 'application/json', 
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretApiKey
          },
          data : data
        };

        const result = await axios(config);
        return res.status(200).send(result.data);

      /*const json = JSON.stringify({
        "description": "Blueish creature. Very durable and tanky.",
        "image": "",
        "name": "Eincode Creature #3",
        "attributes": [
          {
            "trait_type": "attack",
            "value": "60"
          },
          {
            "trait_type": "health",
            "value": "50"
          },
          {
            "trait_type": "speed",
            "value": "70"
          }
        ]
      })

      const jsonRes = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", 
      {
        data : json
      }, {
        headers: {
          'Content-Type': `application/json`,
          'pinata_api_key': `bc858e0e913b1fc0c0d9`,
          'pinata_secret_api_key': `29416b4c287c6aa7e3779df75a39818c5a4afcac5b146b27afd72233eed5681f`
        }
      });
      console.log(jsonRes.data);
      return res.status(200).send(jsonRes.data);*/

    } catch {
      return res.status(422).send({message: "Cannot create JSON"});

    } 
  } else if (req.method === "GET") {
    try {
      const message = { contractAddress, id: uuidv4() };
      req.session.set("message-session", message);
      await req.session.save();

      return res.json(message);
    } catch {
      return res.status(422).send({message: "Cannot generate a message!"});
    }   
  } else {
    return res.status(200).json({message: "Invalid api route"});
  }
})