import { Asset } from 'expo-asset';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { Orientation, printAsync } from 'expo-print';

export async function printCalendar(render, sources, landscape) {
  const entries = await Promise.all(Object.entries(sources).map(async ([key, source]) => {
    const asset = await Asset.fromModule(source).downloadAsync();
    const bytes = await readAsStringAsync(asset.localUri, { encoding: EncodingType.Base64 });
    return [key, 'data:image/png;base64,' + bytes];
  }));
  await printAsync({ html: render(Object.fromEntries(entries)), orientation: landscape ? Orientation.landscape : Orientation.portrait, width: landscape ? 792 : 612, height: landscape ? 612 : 792 });
}
