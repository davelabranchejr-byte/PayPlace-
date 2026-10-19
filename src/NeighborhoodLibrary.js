import React, { useState } from 'react';
import { Image, Linking, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CharacterArtwork from './CharacterArtwork';
import { portraits } from './characters';
import { LIBRARY_BOOKS, LIBRARY_READERS, normalizeLibrary, checkoutBook, returnBook } from './neighborhood-library.mjs';

const covers = { 'before-you-call-me-difficult': require('../assets/books/before-you-call-me-difficult.jpeg') };
const readerFor = id => LIBRARY_READERS.find(reader => reader.id === id);
function Button({label, onPress, secondary = false}) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[s.button, secondary && s.secondary]}>
    <Text style={[s.buttonText, secondary && s.secondaryText]}>{label}</Text>
  </TouchableOpacity>;
}
function Cover({book, style}) {
  return <Image source={covers[book.id]} style={[s.cover, style]} resizeMode="contain" accessibilityLabel={`${book.title} by ${book.author}, approved PayPlace cover`} />;
}
function ReadingCard({book, loan, onOpen}) {
  const reader = readerFor(loan.reader);
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${reader.name} is reading ${book.title}. Open book details`} onPress={onOpen} style={s.readingCard}>
    <View style={s.readingScene}>
      {portraits[reader.id] && <CharacterArtwork source={portraits[reader.id]} style={s.portrait} resizeMode="contain" />}
      <Cover book={book} style={s.readingCover} />
    </View>
    <View style={s.readingText}><Text style={s.eyebrow}>A QUIET READING MOMENT</Text>
      <Text style={s.readerTitle}>{reader.name === 'You' ? 'Your borrowed book' : `${reader.name}’s current read`}</Text>
      <Text style={s.body}>{book.title}</Text><Text style={s.small}>By {book.author} · Shelf {book.shelf}</Text>
    </View>
  </TouchableOpacity>;
}

export default function NeighborhoodLibrary({value, onChange, onNavigate, initialBookId = null, detailsOnly = false, onClose}) {
  const state = normalizeLibrary(value);
  const [selected, setSelected] = useState(initialBookId), [reader, setReader] = useState('you'), [message, setMessage] = useState('');
  const book = LIBRARY_BOOKS.find(item => item.id === selected), loan = book && state.loans[book.id];
  function openBook(id) {setSelected(id); setReader('you'); setMessage('');}
  function closeBook() {setSelected(null); onClose?.();}
  function change(action) {
    onChange(current => action(current));
    setMessage('');
  }
  async function visitAuthor() {
    try { await Linking.openURL(book.purchaseUrl); }
    catch { setMessage('The book page could not open. Please try again.'); }
  }
  return <View style={detailsOnly ? undefined : s.library}>
    {!detailsOnly && <>
    <Text style={s.eyebrow}>A HOME FOR STORIES</Text>
    <Text accessibilityRole="header" style={s.title}>Annie’s Neighborhood Library</Text>
    <Text style={s.body}>Every story has a place. Emma’s book is our very first neighbor on the shelf.</Text>
    <Text style={s.small}>Tap a cover or its empty spot to see the book and who has borrowed it.</Text>
    <View style={s.bookcase}>
      <ScrollView horizontal contentContainerStyle={s.shelfRow}>
        {LIBRARY_BOOKS.map(item => {
          const borrowed = state.loans[item.id];
          return <View key={item.shelf} style={s.slot} testID={`library-slot-${item.shelf}`}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${item.title}, shelf ${item.shelf}. ${borrowed ? `Empty spot; borrowed by ${readerFor(borrowed.reader).name}` : 'Available to borrow'}`} onPress={() => openBook(item.id)} style={[s.bookSpace, borrowed && s.emptySpace]}>
              {borrowed ? <><Text style={s.emptyTitle}>This story is out visiting</Text><Text style={s.small}>With {readerFor(borrowed.reader).name}</Text><Text style={s.small}>Its place stays right here.</Text></> : <Cover book={item} />}
            </TouchableOpacity>
            <View style={s.plaque}><Text style={s.plaqueText}>Shelf {item.shelf} · Emma Acly</Text><Text style={s.plaqueTitle}>{item.title}</Text></View>
          </View>;
        })}
      </ScrollView>
    </View>
    {LIBRARY_BOOKS.filter(item => state.loans[item.id]).map(item => <ReadingCard key={item.id} book={item} loan={state.loans[item.id]} onOpen={() => openBook(item.id)} />)}
    <Text style={s.small}>The mascot reading circle changes each day you visit. Books you check out stay with your chosen reader until you return them. This neighborhood copy and ledger are saved in your plan on this device.</Text>
    <Text accessibilityRole="header" style={s.readerTitle}>Annie’s checkout ledger</Text>
    {state.history.length ? state.history.slice().reverse().map((entry, index) => <View key={`${entry.at}-${index}`} style={s.ledgerRow}>
      <Text style={s.body}>{readerFor(entry.reader).name} {entry.action === 'borrow' ? 'borrowed' : 'returned'} {LIBRARY_BOOKS.find(item => item.id === entry.bookId).title}</Text>
      <Text style={s.small}>{new Date(entry.at).toLocaleDateString()} · Shelf {LIBRARY_BOOKS.find(item => item.id === entry.bookId).shelf}</Text>
    </View>) : <Text style={s.body}>Our first book is home. The ledger will remember its visits.</Text>}
    </>}
    <Modal visible={!!book} animationType="slide" onRequestClose={closeBook}>
      <SafeAreaView style={s.modal}><ScrollView contentContainerStyle={s.details}>
        <Button label={detailsOnly ? 'Back to reading' : 'Back to Annie’s library'} onPress={closeBook} secondary />
        {book && <>
          <Cover book={book} style={s.detailCover} />
          <Text accessibilityRole="header" style={s.title}>{book.title}</Text>
          <Text style={s.subtitle}>{book.subtitle}</Text><Text style={s.readerTitle}>By {book.author}</Text>
          <Text style={s.body}>{book.description}</Text>
          <Text style={s.small}>Borrowing moves our illustrated neighborhood copy. To read the memoir, visit the book’s Amazon page.</Text>
          <Button label="View Emma’s book on Amazon" onPress={visitAuthor} />
          {loan ? <>
            <Text style={s.body}>Borrowed by {readerFor(loan.reader).name}. Shelf {book.shelf} stays empty until it comes home.</Text>
            <Button label={`Return to shelf ${book.shelf}`} onPress={() => change(current => returnBook(current, book.id))} secondary />
            {!detailsOnly && readerFor(loan.reader).room !== 'Annie' && onNavigate && <Button label={`Visit ${readerFor(loan.reader).name} reading`} onPress={() => {closeBook(); onNavigate(readerFor(loan.reader).room);}} secondary />}
          </> : <>
            <Text accessibilityRole="header" style={s.readerTitle}>Who would like to borrow it?</Text>
            <View style={s.choices}>{LIBRARY_READERS.map(person => <TouchableOpacity key={person.id} accessibilityRole="radio" accessibilityState={{checked: reader === person.id}} accessibilityLabel={`Choose ${person.name} as reader`} onPress={() => setReader(person.id)} style={[s.choice, reader === person.id && s.chosen]}><Text style={s.choiceText}>{person.name}</Text></TouchableOpacity>)}</View>
            <Button label={`Borrow for ${readerFor(reader).name}`} onPress={() => change(current => checkoutBook(current, book.id, reader))} />
          </>}
          {!!message && <Text accessibilityLiveRegion="polite" style={s.body}>{message}</Text>}
        </>}
      </ScrollView></SafeAreaView>
    </Modal>
  </View>;
}

export function LibraryReader({value, destination, onNavigate, onChange}) {
  const [selected, setSelected] = useState(null);
  const state = normalizeLibrary(value);
  const books = LIBRARY_BOOKS.filter(book => readerFor(state.loans[book.id]?.reader)?.room === destination);
  return <View style={s.roomLibrary}>
    {books.map(book => <ReadingCard key={book.id} book={book} loan={state.loans[book.id]} onOpen={() => setSelected(book.id)} />)}
    <Button label="Visit Annie’s Neighborhood Library" onPress={() => onNavigate('Annie')} secondary />
    {selected && <NeighborhoodLibrary key={selected} value={value} onChange={onChange} onNavigate={onNavigate} initialBookId={selected} detailsOnly onClose={() => setSelected(null)} />}
  </View>;
}

const s = StyleSheet.create({
  library: {backgroundColor:'#FFF6E6', borderWidth:1, borderColor:'#D9B983', borderRadius:24, padding:16, gap:12},
  eyebrow: {fontSize:10, fontWeight:'900', letterSpacing:1.5, color:'#8D4058'},
  title: {fontSize:25, lineHeight:32, fontWeight:'900', color:'#173557'}, subtitle:{fontSize:18,lineHeight:26,color:'#34465E'},
  body:{fontSize:15,lineHeight:23,color:'#34465E'}, small:{fontSize:13,lineHeight:20,color:'#536077'},
  bookcase:{borderRadius:16, backgroundColor:'#633A29',paddingTop:14,overflow:'hidden',borderBottomWidth:12,borderColor:'#8B5134'},
  shelfRow:{paddingHorizontal:12,gap:16,paddingBottom:8},slot:{width:205,gap:10},
  bookSpace:{height:225,justifyContent:'center',alignItems:'center',padding:4,borderRadius:12},
  emptySpace:{borderWidth:2,borderStyle:'dashed',borderColor:'#E6CAA6',backgroundColor:'#FFF6E6',padding:16,gap:12},
  emptyTitle:{fontSize:20,lineHeight:28,fontWeight:'800',textAlign:'center',color:'#6550AF'},
  cover:{width:'100%',height:'100%'},plaque:{backgroundColor:'#FFE9AF',borderRadius:9,padding:9,gap:4},
  plaqueText:{fontSize:11,fontWeight:'800',color:'#60361D'},plaqueTitle:{fontSize:14,lineHeight:21,fontWeight:'800',color:'#60361D'},
  readingCard:{backgroundColor:'#EEE8FC',borderRadius:18,padding:12,gap:12,alignItems:'center'},
  readingScene:{width:200,height:215,alignItems:'center',justifyContent:'center'},portrait:{width:165,height:190,position:'absolute',top:0},
  readingCover:{position:'absolute',width:115,height:115,bottom:0,right:0},readingText:{width:'100%',gap:6},
  readerTitle:{fontSize:18,lineHeight:26,fontWeight:'800',color:'#173557'},
  ledgerRow:{paddingVertical:10,borderBottomWidth:1,borderColor:'#E6D4BB',gap:4},
  button:{minHeight:48,backgroundColor:'#6550AF',borderRadius:14,padding:14,justifyContent:'center',alignItems:'center'},
  buttonText:{fontSize:15,lineHeight:22,fontWeight:'800',color:'#FFF',textAlign:'center'},secondary:{backgroundColor:'#EEE8FC'},secondaryText:{color:'#513A90'},
  modal:{flex:1,backgroundColor:'#FFF8F2'},details:{padding:18,paddingBottom:40,gap:14,width:'100%',maxWidth:680,alignSelf:'center'},detailCover:{width:'100%',height:340},
  choices:{flexDirection:'row',flexWrap:'wrap',gap:8},choice:{minHeight:48,padding:12,borderRadius:12,borderWidth:2,borderColor:'#DED5EF',backgroundColor:'#FFF'},
  chosen:{backgroundColor:'#E7DCF9',borderColor:'#6550AF'},choiceText:{fontSize:15,fontWeight:'800',color:'#513A90'},roomLibrary:{gap:12},
});
