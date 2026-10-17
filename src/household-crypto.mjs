import { gcm } from '@noble/ciphers/aes';
import { bytesToHex,hexToBytes,utf8ToBytes,bytesToUtf8 } from '@noble/ciphers/utils';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { BACKUP_ITERATIONS } from './security-crypto.mjs';
import { validateHouseholdSnapshot } from './household-plan.mjs';
const aad=utf8ToBytes('PayPlace selective household sharing v1');
const limit=500000;
function passwordCheck(password){if(typeof password!=='string'||password.length<12||password.length>200)throw Error('Use a household password of 12–200 characters.');}
export async function encryptHousehold(snapshot,password,randomBytes){
  passwordCheck(password);const safe=validateHouseholdSnapshot(snapshot),salt=randomBytes(16),nonce=randomBytes(12);
  const key=await pbkdf2Async(sha256,utf8ToBytes(password),salt,{c:BACKUP_ITERATIONS,dkLen:32,asyncTick:10});
  try{
    const result=JSON.stringify({kind:'payplace-household',version:1,cipher:'AES-256-GCM',iterations:BACKUP_ITERATIONS,salt:bytesToHex(salt),nonce:bytesToHex(nonce),ciphertext:bytesToHex(gcm(key,nonce,aad).encrypt(utf8ToBytes(JSON.stringify(safe))))});
    if(result.length>limit)throw Error('Choose fewer shared bills.');return result;
  }finally{key.fill(0);}
}
export async function decryptHousehold(text,password){
  passwordCheck(password);if(typeof text!=='string'||text.length>limit)throw Error('Choose a valid household plan smaller than 500 KB.');
  let data;try{data=JSON.parse(text);}catch{throw Error('This is not an encrypted household plan.');}
  if(data?.kind!=='payplace-household'||data.version!==1||data.cipher!=='AES-256-GCM'||data.iterations!==BACKUP_ITERATIONS||! /^[0-9a-f]{32}$/.test(data.salt)||! /^[0-9a-f]{24}$/.test(data.nonce)||typeof data.ciphertext!=='string'||! /^[0-9a-f]+$/.test(data.ciphertext)||data.ciphertext.length%2||data.ciphertext.length<32)throw Error('This is not a supported household plan.');
  const key=await pbkdf2Async(sha256,utf8ToBytes(password),hexToBytes(data.salt),{c:BACKUP_ITERATIONS,dkLen:32,asyncTick:10});
  try{return validateHouseholdSnapshot(JSON.parse(bytesToUtf8(gcm(key,hexToBytes(data.nonce),aad).decrypt(hexToBytes(data.ciphertext)))));}
  catch{throw Error('The password is incorrect or the household plan is damaged.');}
  finally{key.fill(0);}
}
