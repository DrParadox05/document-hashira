import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { ethers } from 'ethers';

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';
const contractABI = [
  {
    "inputs": [
        {
            "internalType": "string",
            "name": "orgId",
            "type": "string"
        }
    ],
    "name": "getMerkleRoot",
    "outputs": [
        {
            "internalType": "bytes32",
            "name": "merkleRoot",
            "type": "bytes32"
        }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
        {
            "internalType": "string",
            "name": "orgId",
            "type": "string"
        },
        {
            "internalType": "bytes32",
            "name": "merkleRoot",
            "type": "bytes32"
        }
    ],
    "name": "storeMerkleRoot",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
];

type DocumentHashRecord = {
  orgId: string;
  fileName: string;
  hash: string;
};

let documentHashes: DocumentHashRecord[] = [];

function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (data) => {
      hash.update(data);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

const createMerkleRoot = (hashes: string[]): string => {
  if (hashes.length === 1) {
    return hashes[0];
  }

  const newLevel: string[] = [];

  for (let i = 0; i < hashes.length; i += 2) {
    const left = hashes[i];
    const right = hashes[i + 1] || left; 
    const combinedHash = createHash('sha256').update(left + right).digest('hex');
    newLevel.push(combinedHash);
  }

  return createMerkleRoot(newLevel);
};

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not set in the environment variables.");
}

const provider = new ethers.JsonRpcProvider(RPC_URL, chainId);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

async function storeMerkleRoot(orgId: string, merkleRoot: string) {
    try {
        const tx = await contract.storeMerkleRoot(orgId, merkleRoot);
        await tx.wait(); // Wait for the transaction to be mined
        console.log(`Merkle root stored successfully with document ID: ${orgId}`);
    } catch (error) {
        console.error('Error storing Merkle root:', error);
    }
}

async function getMerkleRoot(orgId: string) {
    try {
        const merkleRoot = await contract.getMerkleRoot(orgId);
        console.log(`Merkle root for document ID ${orgId}: ${merkleRoot}`);
        return merkleRoot;
    } catch (error) {
        console.error('Error retrieving Merkle root:', error);
    }
}

const main = async () => {
  const filePaths = ['files/bigFile1.txt', 'files/example.txt', 'files/bigFile1.txt']; 

  const documentHashesPromises = filePaths.map(filePath => hashFile(filePath));
  const documentHashes = await Promise.all(documentHashesPromises);

  console.log('Document Hashes:', documentHashes);

  const merkleRoot = createMerkleRoot(documentHashes);
  console.log('Merkle Root:', merkleRoot);
};

main().catch(error => console.error('Error:', error));
