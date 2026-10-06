import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeContact, hasVerifiedContact, verifiedAnswers } from '../src/contact-verification.mjs';
test('email and international phone validation', () => {
  assert.equal(normalizeContact('email',' A@Example.com '),'a@example.com');
  assert.equal(normalizeContact('sms','+1 (202) 555-0100'),'+12025550100');
  for(const value of ['2025550100','++12025550100','+1202x5550100','+0123456789']) assert.equal(normalizeContact('sms',value),null);
  assert.equal(normalizeContact('email','broken'),null);
});
test('visitors and unverified completion cannot enter; legacy verified email is retained', () => {
  assert.equal(hasVerifiedContact({completed:true,guest:true,email:'a@example.com'}),false);
  assert.equal(hasVerifiedContact({emailVerified:true,email:'a@example.com'}),true);
  assert.equal(hasVerifiedContact({contactVerified:true,contactChannel:'sms',contact:'+12025550100'}),true);
});
test('verification requires matching server response and stores chosen delivery method', () => {
  const result={verified:true,channel:'sms',contact:'+12025550100',verifiedAt:'2026-10-06T00:00:00.000Z'};
  const saved=verifiedAnswers({name:'Neighbor',guest:true},result,'sms',result.contact,true);
  assert.equal(saved.guest,false); assert.equal(saved.phoneVerified,true);assert.equal(saved.emailVerified,false);assert.equal(saved.notificationChannel,'sms');
  assert.throws(()=>verifiedAnswers({}, {...result,verified:false},'sms',result.contact,true));
  assert.throws(()=>verifiedAnswers({},result,'email','a@example.com',true));
  assert.equal(verifiedAnswers({},result,'sms',result.contact,false).notificationChannel,null);
});
