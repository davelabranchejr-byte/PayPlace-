import React, { createContext, useContext } from 'react';
import { Text as NativeText, TextInput as NativeTextInput } from 'react-native';
import { privateText } from './launch-essentials.mjs';
export const PrivacyContext=createContext({hideAmounts:false,reduceAnimation:false});
export function Text({children,accessibilityLabel,...props}) {
  const {hideAmounts}=useContext(PrivacyContext);
  const mask = child => typeof child==='string' ? privateText(child) : React.isValidElement(child) ? React.cloneElement(child,{},React.Children.map(child.props.children,mask)) : child;
  // Joining adjacent strings handles JSX such as "$" followed by an amount.
  const groups=React.Children.toArray(children);
  const joined=groups.every(c => typeof c==='string'||typeof c==='number') ? groups.join('') : groups;
  return <NativeText {...props} accessibilityLabel={hideAmounts?privateText(accessibilityLabel):accessibilityLabel}>{hideAmounts?React.Children.map(joined,mask):children}</NativeText>;
}
export function TextInput({keyboardType,accessibilityLabel,...props}) {
  const {hideAmounts}=useContext(PrivacyContext);
  const monetary=keyboardType==='decimal-pad' || /amount|balance|saved|contribution|buffer|allowance|\$/i.test(accessibilityLabel || '');
  return <NativeTextInput {...props} keyboardType={keyboardType} accessibilityLabel={accessibilityLabel}
    {...(hideAmounts&&monetary ? {secureTextEntry:true,accessibilityValue:{text:'Amount hidden'},autoComplete:'off'} : {})} />;
}
