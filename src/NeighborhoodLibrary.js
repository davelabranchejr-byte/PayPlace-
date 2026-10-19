import React, { useState } from 'react';
import { Image, Linking, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CharacterArtwork from './CharacterArtwork';
import ContainedIllustration from './ContainedIllustration';
import ExpandableSection from './ExpandableSection';
import { LIBRARY_BOOKS, LIBRARY_READERS, normalizeLibrary, checkoutBook, returnBook } from './neighborhood-library.mjs';
import { MASCOT_BOOKS, LIBRARY_VISIBLE_HEIGHT, EM_SHELF_BOUNDS, MASCOT_SHELF_BOUNDS, shelfTarget } from './library-stories.mjs';
import { libraryStocked, libraryAway, readingArtwork } from './LibraryArtwork';

const emBook = LIBRARY_BOOKS[0];
const cover = require('../assets/books/before-you-call-me-difficult.jpeg');
const readerFor = id => LIBRARY_READERS.find(reader => reader.id === id);
function Button({label, onPress, secondary = false}) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[s.button, secondary && s.secondary]}>
    <Text style={[s.buttonText, secondary && s.secondaryText]}>{label}</Text>
  </TouchableOpacity>;
}

export function IllustratedLibraryShelf({borrowed, onBook, onStory, enlarged = false}) {
  return <View testID="illustrated-library-shelf" style={[s.shelfScene, enlarged && {width:720}]}>
    <Image testID="library-shelf-artwork" source={borrowed ? libraryAway : libraryStocked}
      resizeMode="stretch" style={s.shelfArtwork} accessible={false} />
    <Pressable testID="library-slot-A1" style={({pressed}) => [s.shelfTarget, shelfTarget(EM_SHELF_BOUNDS), pressed && s.pressedTarget]}
      accessibilityRole="button" accessibilityLabel={emBook.title + ', shelf A1. ' + (borrowed ? 'Empty spot; borrowed by ' + readerFor(borrowed.reader).name : 'Available to borrow')}
      accessibilityHint="Opens Emma’s book details and checkout."
      onPress={onBook} />
    {MASCOT_BOOKS.map((book, index) => <Pressable key={book.id}
      style={({pressed}) => [s.shelfTarget, shelfTarget(MASCOT_SHELF_BOUNDS[index]), pressed && s.pressedTarget]}
      accessibilityRole="button" accessibilityLabel={'Read ' + book.title + ' by ' + book.author}
      onPress={() => onStory(book.id)} />)}
  </View>;
}

function ReadingCard({book, loan, onOpen}) {
  const reader = readerFor(loan.reader), scene = readingArtwork(reader.id);
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={reader.name + ' is reading ' + book.title + '. Open book details'} onPress={onOpen} style={s.readingCard}>
    {scene && <ContainedIllustration source={scene.source} aspectRatio={scene.ratio} style={s.readingIllustration}
      testID={'library-reading-scene-' + reader.id} accessibilityLabel={scene.label} />}
    <View style={s.readingText}>
      <Text style={s.eyebrow}>OUT AND ABOUT WITH A GOOD BOOK</Text>
      <Text style={s.readerTitle}>{reader.name === 'You' ? 'Your borrowed book' : reader.name + '’s current read'}</Text>
      <Text style={s.body}>{book.title}</Text><Text style={s.small}>By {book.author} · Tap to visit this book.</Text>
    </View>
  </TouchableOpacity>;
}

export function LibraryBookDetails({bookId, value, onChange, onClose, onNavigate, backLabel = 'Back to Annie’s library'}) {
  const state = normalizeLibrary(value);
  const book = LIBRARY_BOOKS.find(item => item.id === bookId), loan = book && state.loans[book.id];
  const [reader, setReader] = useState('you'), [message, setMessage] = useState('');
  async function visitAuthor() {
    try { await Linking.openURL(book.purchaseUrl); }
    catch { setMessage('The book page could not open. Please try again.'); }
  }
  return <Modal visible={!!book} animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={s.modal}><ScrollView contentContainerStyle={s.details}>
      <Button label={backLabel} onPress={onClose} secondary />
      {book && <>
        <Image source={cover} style={s.detailCover} resizeMode="contain" accessibilityLabel={book.title + ' by ' + book.author + ', approved PayPlace cover'} />
        <Text accessibilityRole="header" style={s.title}>{book.title}</Text>
        <Text style={s.subtitle}>{book.subtitle}</Text><Text style={s.readerTitle}>By {book.author}</Text>
        <Text style={s.body}>{book.description}</Text>
        <Text style={s.small}>Our illustrated neighborhood copy travels between readers. Find the memoir itself on Emma’s Amazon page.</Text>
        <Button label="View Emma’s book on Amazon" onPress={visitAuthor} />
        {loan ? <>
          <Text style={s.body}>Borrowed by {readerFor(loan.reader).name}. Its place between the other books on shelf A1 is waiting.</Text>
          <Button label="Return to shelf A1" onPress={() => onChange(current => returnBook(current, book.id))} secondary />
          {onNavigate && readerFor(loan.reader).room !== 'Annie' && <Button label={'Visit ' + readerFor(loan.reader).name + ' reading'} onPress={() => {onClose(); onNavigate(readerFor(loan.reader).room);}} secondary />}
        </> : <>
          <Text accessibilityRole="header" style={s.readerTitle}>Who would like to borrow it?</Text>
          <View style={s.choices}>{LIBRARY_READERS.map(person => <TouchableOpacity key={person.id} accessibilityRole="radio" accessibilityState={{checked: reader === person.id}} accessibilityLabel={'Choose ' + person.name + ' as reader'} onPress={() => setReader(person.id)} style={[s.choice, reader === person.id && s.chosen]}><Text style={s.choiceText}>{person.name}</Text></TouchableOpacity>)}</View>
          <Button label={'Borrow for ' + readerFor(reader).name} onPress={() => onChange(current => checkoutBook(current, book.id, reader))} />
        </>}
        {!!message && <Text accessibilityLiveRegion="polite" style={s.body}>{message}</Text>}
      </>}
    </ScrollView></SafeAreaView>
  </Modal>;
}

function MascotStory({id, onClose}) {
  const book = MASCOT_BOOKS.find(item => item.id === id);
  const position = MASCOT_BOOKS.findIndex(item => item.id === id);
  const bounds = MASCOT_SHELF_BOUNDS[position];
  return <Modal visible={!!book} animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={s.modal}><ScrollView contentContainerStyle={s.details}>
      <Button label="Back to the library shelves" onPress={onClose} secondary />
      {book && <>
        <CharacterArtwork source={{source:libraryStocked,width:1254,height:1254,
          crop:[bounds.left*1254,bounds.top*1254,bounds.width*1254,bounds.height*1254],label:book.title + ' by ' + book.author}}
          resizeMode="contain" style={s.storyCover} />
        <Text accessibilityRole="header" style={s.title}>{book.title}</Text>
        <Text style={s.readerTitle}>By {book.author}</Text>
        {!!book.subtitle && <Text style={s.subtitle}>{book.subtitle}</Text>}
        <Text style={s.small}>An original little story from your PayPlace neighbors.</Text>
        {book.paragraphs.map((paragraph,index) => <Text key={index} style={s.storyParagraph}>{paragraph}</Text>)}
      </>}
    </ScrollView></SafeAreaView>
  </Modal>;
}

export default function NeighborhoodLibrary({value, onChange, onNavigate, initialBookId = null, detailsOnly = false, onClose}) {
  const state = normalizeLibrary(value), loan = state.loans[emBook.id];
  const [selected, setSelected] = useState(initialBookId), [story, setStory] = useState(null), [enlarged, setEnlarged] = useState(false);
  function closeBook() {setSelected(null); onClose?.();}
  function openBook() {setEnlarged(false); setSelected(emBook.id);}
  function openStory(id) {setEnlarged(false); setStory(id);}
  return <View style={detailsOnly ? undefined : s.library}>
    {!detailsOnly && <>
      <View style={s.intro}><Text style={s.eyebrow}>COME INTO ANNIE’S READING NOOK</Text>
        <Text accessibilityRole="header" style={s.title}>Annie’s Neighborhood Library</Text>
        <Text style={s.body}>Stories by our neighbors, with a special place for Emma’s memoir. Tap a book on the shelves to visit it.</Text>
      </View>
      <IllustratedLibraryShelf borrowed={loan} onBook={openBook} onStory={openStory} />
      <View style={s.libraryContent}>
        <Button label="Take a closer look at the library" onPress={() => setEnlarged(true)} secondary />
        <Text accessibilityLiveRegion="polite" style={s.body}>{loan ? 'Emma’s book is with ' + readerFor(loan.reader).name + '. The gap on shelf A1 stays open until it comes home.' : 'Emma’s book is home on shelf A1, nestled between the neighborhood stories.'}</Text>
        <Button label={loan ? 'Who has Emma’s book?' : 'Visit Emma’s book'} onPress={openBook} />
        {loan && <ReadingCard book={emBook} loan={loan} onOpen={openBook} />}
        <ExpandableSection title="Books on Annie’s shelves">
          {MASCOT_BOOKS.map(book => <TouchableOpacity key={book.id} accessibilityRole="button"
            accessibilityLabel={'Open neighborhood story ' + book.title} onPress={() => openStory(book.id)} style={s.catalogueRow}>
            <Text style={s.readerTitle}>{book.title}</Text><Text style={s.small}>By {book.author}</Text>
          </TouchableOpacity>)}
        </ExpandableSection>
        <Text style={s.small}>The mascot reading circle changes each day you visit. A book you check out stays with your chosen reader until you return it.</Text>
        <ExpandableSection title="Annie’s checkout ledger">
          {state.history.length ? state.history.slice().reverse().map((entry,index) => <View key={entry.at + '-' + index} style={s.ledgerRow}>
            <Text style={s.body}>{readerFor(entry.reader).name} {entry.action === 'borrow' ? 'borrowed' : 'returned'} {emBook.title}</Text>
            <Text style={s.small}>{new Date(entry.at).toLocaleDateString()} · Shelf A1</Text>
          </View>) : <Text style={s.body}>Our first guest book is home. The ledger will remember its visits.</Text>}
        </ExpandableSection>
      </View>
      <Modal visible={enlarged} animationType="fade" onRequestClose={() => setEnlarged(false)}>
        <SafeAreaView style={s.modal}>
          <View style={s.zoomHeading}><Button label="Back to Annie’s library" onPress={() => setEnlarged(false)} secondary />
            <Text style={s.small}>Swipe across or down for a closer look. Tap any book.</Text></View>
          <ScrollView><ScrollView horizontal contentContainerStyle={s.zoomContent}>
            <IllustratedLibraryShelf enlarged borrowed={loan} onBook={openBook} onStory={openStory} />
          </ScrollView></ScrollView>
        </SafeAreaView>
      </Modal>
      {story && <MascotStory id={story} onClose={() => setStory(null)} />}
    </>}
    {selected && <LibraryBookDetails key={selected} bookId={selected} value={value} onChange={onChange} onClose={closeBook} onNavigate={detailsOnly ? undefined : onNavigate} backLabel={detailsOnly ? 'Back to reading' : 'Back to Annie’s library'} />}
  </View>;
}

export function LibraryReader({value, destination, onNavigate, onChange}) {
  const [selected, setSelected] = useState(null);
  const loan = normalizeLibrary(value).loans[emBook.id];
  const readingHere = readerFor(loan?.reader)?.room === destination;
  return <View style={s.roomLibrary}>
    {readingHere && <ReadingCard book={emBook} loan={loan} onOpen={() => setSelected(emBook.id)} />}
    <Button label="Visit Annie’s Neighborhood Library" onPress={() => onNavigate('Annie')} secondary />
    {selected && <LibraryBookDetails bookId={selected} value={value} onChange={onChange} onClose={() => setSelected(null)} backLabel="Back to reading" />}
  </View>;
}

const s = StyleSheet.create({
  library:{backgroundColor:'#FFF6E6',borderWidth:1,borderColor:'#D9B983',borderRadius:24,overflow:'hidden'},
  intro:{padding:16,gap:10},libraryContent:{padding:16,gap:12},
  eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1.5,color:'#8D4058'},
  title:{fontSize:25,lineHeight:32,fontWeight:'900',color:'#173557'},
  subtitle:{fontSize:18,lineHeight:26,color:'#34465E'},body:{fontSize:15,lineHeight:23,color:'#34465E'},
  small:{fontSize:13,lineHeight:20,color:'#536077'},
  shelfScene:{width:'100%',aspectRatio:1/LIBRARY_VISIBLE_HEIGHT,overflow:'hidden',position:'relative',backgroundColor:'#633A29'},
  shelfArtwork:{position:'absolute',top:0,left:0,width:'100%',height:(100/LIBRARY_VISIBLE_HEIGHT)+'%'},
  shelfTarget:{position:'absolute',borderRadius:8,borderWidth:2,borderColor:'transparent'},
  pressedTarget:{backgroundColor:'rgba(255,237,178,0.18)',borderColor:'#FFE89B'},
  readingCard:{backgroundColor:'#FFFDF8',borderWidth:1,borderColor:'#E7D6B9',borderRadius:18,overflow:'hidden'},
  readingIllustration:{width:'100%'},readingText:{padding:14,gap:6},
  readerTitle:{fontSize:18,lineHeight:26,fontWeight:'800',color:'#173557'},
  ledgerRow:{paddingVertical:10,borderBottomWidth:1,borderColor:'#E6D4BB',gap:4},
  catalogueRow:{minHeight:56,paddingVertical:12,borderBottomWidth:1,borderColor:'#E6D4BB',gap:4},
  button:{minHeight:48,backgroundColor:'#6550AF',borderRadius:14,padding:14,justifyContent:'center',alignItems:'center'},
  buttonText:{fontSize:15,lineHeight:22,fontWeight:'800',color:'#FFF',textAlign:'center'},
  secondary:{backgroundColor:'#EEE8FC'},secondaryText:{color:'#513A90'},
  modal:{flex:1,backgroundColor:'#FFF8F2'},
  details:{padding:18,paddingBottom:40,gap:14,width:'100%',maxWidth:680,alignSelf:'center'},
  detailCover:{width:'100%',height:340},storyCover:{width:'100%',height:260},storyParagraph:{fontSize:18,lineHeight:29,color:'#34465E'},
  choices:{flexDirection:'row',flexWrap:'wrap',gap:8},
  choice:{minHeight:48,padding:12,borderRadius:12,borderWidth:2,borderColor:'#DED5EF',backgroundColor:'#FFF'},
  chosen:{backgroundColor:'#E7DCF9',borderColor:'#6550AF'},choiceText:{fontSize:15,fontWeight:'800',color:'#513A90'},
  roomLibrary:{gap:12},zoomHeading:{padding:16,gap:8},zoomContent:{padding:12},
});
