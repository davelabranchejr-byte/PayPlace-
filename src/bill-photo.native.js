import * as Picker from 'expo-image-picker';
import * as Manipulator from 'expo-image-manipulator';
import * as Files from 'expo-file-system/legacy';
import { readBillPhoto } from './bill-photo-flow.mjs';

export const supportsBillPhoto = true;
export function scanBillPhoto(source) {
  return readBillPhoto(source, {
    cacheDirectory:Files.cacheDirectory,
    cameraPermission:() => Picker.requestCameraPermissionsAsync(),
    pick:method => (method === 'camera' ? Picker.launchCameraAsync : Picker.launchImageLibraryAsync)({mediaTypes:['images'], quality:1, allowsEditing:false, allowsMultipleSelection:false, exif:false}),
    normalize:asset => Manipulator.manipulateAsync(asset.uri, Math.max(asset.width || 0, asset.height || 0) > 2000 ? [{resize:asset.width >= asset.height ? {width:2000} : {height:2000}}] : [], {compress:0.95, format:Manipulator.SaveFormat.JPEG}),
    recognize:async uri => {
      // A native build is required; Expo Go and older binaries cannot load ML Kit.
      let recognizeText;
      try { ({recognizeText} = require('@infinitered/react-native-mlkit-text-recognition')); }
      catch { throw new Error('Photo scanning needs the latest PayPlace app build. Please update the app and try again.'); }
      return recognizeText(uri);
    },
    remove:uri => Files.deleteAsync(uri, {idempotent:true}),
  });
}
