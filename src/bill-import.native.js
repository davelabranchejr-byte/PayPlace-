import * as Picker from 'expo-image-picker';
import * as Documents from 'expo-document-picker';
import * as Manipulator from 'expo-image-manipulator';
import * as Files from 'expo-file-system/legacy';
import { requireNativeModule } from 'expo';
import { processBillAssets } from './bill-import-flow.mjs';
export const supportsBillImport=true;
const adapter={
  cacheDirectory:Files.cacheDirectory,
  makeFolder:async()=>{const uri=Files.cacheDirectory+`Billiam-${Date.now()}-${Math.random().toString(36).slice(2)}/`;await Files.makeDirectoryAsync(uri,{intermediates:true});return uri;},
  readPDF:(uri,folder)=>{
    let module;try{module=requireNativeModule('PayPlaceBillDocuments');}catch{throw Error('PDF reading requires the latest native PayPlace build.');}
    return module.readPDF(uri,folder);
  },
  normalize:async asset=>{
    const info=asset.width?asset:await Manipulator.manipulateAsync(asset.uri,[],{format:Manipulator.SaveFormat.JPEG});
    let result;
    try { result=await Manipulator.manipulateAsync(info.uri,Math.max(info.width || 0,info.height || 0)>2000?[{resize:info.width>=info.height?{width:2000}:{height:2000}}]:[],{compress:0.95,format:Manipulator.SaveFormat.JPEG}); return result; }
    finally { if(info.uri!==asset.uri && info.uri!==result?.uri && info.uri.startsWith(Files.cacheDirectory))await Files.deleteAsync(info.uri,{idempotent:true}); }

  },
  recognize:uri=>{
    let recognizeText;try{({recognizeText}=require('@infinitered/react-native-mlkit-text-recognition'));}catch{throw Error('Bill reading requires the latest native PayPlace build.');}
    return recognizeText(uri);
  },
  remove:uri=>Files.deleteAsync(uri,{idempotent:true}),
};
export async function importBillDocuments(){
  const result=await Documents.getDocumentAsync({type:['application/pdf','image/*'],multiple:true,copyToCacheDirectory:true});
  if(result.canceled)return null;
  if(result.assets.length>12){await Promise.all(result.assets.filter(a=>a.uri.startsWith(Files.cacheDirectory)).map(a=>adapter.remove(a.uri).catch(()=>{})));throw Error('Choose up to 12 files at a time.');}
  return processBillAssets(result.assets,adapter);
}
export async function importBillBatch(){
  const result=await Picker.launchImageLibraryAsync({mediaTypes:['images'],allowsMultipleSelection:true,selectionLimit:12,quality:1,exif:false});
  return result.canceled?null:processBillAssets(result.assets,adapter);
}
