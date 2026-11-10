import { parseBillText } from './bill-scanner.mjs';
import { parseBreakdown } from './billiam-tools.mjs';
export async function processBillAssets(assets,device){
  if(!Array.isArray(assets) || assets.length>12)throw Error('Choose up to 12 bills at a time.');
  const results=[];
  for(const [index,asset] of assets.entries()){
    let folder;
    const owned=new Set();
    const remember=uri=>{if(uri && device.cacheDirectory && uri.startsWith(device.cacheDirectory))owned.add(uri);};
    remember(asset.uri);
    try{
      if(!asset.uri || (asset.size || asset.fileSize || 0)>20*1024*1024)throw Error('Choose a bill smaller than 20 MB.');
      const pdf=asset.mimeType==='application/pdf' || /\.pdf$/i.test(asset.name || '');
      let text='';
      if(pdf){
        folder=await device.makeFolder();
        const pages=await device.readPDF(asset.uri,folder);
        if(!Array.isArray(pages) || !pages.length || pages.length>12)throw Error('Choose a PDF with 1–12 pages.');
        for(const page of pages){
          text += '\n'+(page.text || (await device.recognize(page.uri)).text || '');
          if(text.length>50000)throw Error('This bill has too much text. Import a shorter document.');
        }
      }else{
        const normalized=await device.normalize(asset);remember(normalized.uri);
        text=(await device.recognize(normalized.uri)).text || '';
      }
      if(!text.trim())throw Error('No readable text found. Try a clearer image.');
      results.push({label:`Bill ${index+1}`,draft:{...parseBillText(text),breakdown:parseBreakdown(text)}});
    }catch(error){results.push({label:`Bill ${index+1}`,error:error.message || 'Could not read this bill.'});}
    finally{
      await Promise.all([...owned,...(folder?[folder]:[])].map(uri=>device.remove(uri).catch(()=>{})));
    }
  }
  return results;
}
