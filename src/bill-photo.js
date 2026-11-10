export const supportsBillPhoto = false;
export async function scanBillPhoto() {
  throw new Error('Photo scanning is available in the iPhone and Android app. You can add a bill manually here.');
}
