import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import { EncouragementSpot } from './Encouragement';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import FamilyWall, { AnnieRoomPortraits, CharacterStory, FAMILY_STORIES } from './FamilyWall';
import { ChairQuilt, QuiltDetail } from './BelongingQuilt';
import BobbieSmartMirror from './BobbieSmartMirror';
import { SmallSteps } from './NeighborCare';
import { neighborhoodLabel } from './neighborhood-destinations.mjs';
import NeighborhoodLibrary, { LibraryReader } from './NeighborhoodLibrary';
import InteractiveRoom from './InteractiveRoom';
import { RoomVisitors } from './NeighborhoodWorld';
import FacebookNeighborhood from './FacebookNeighborhood';
import TesterFeedback from './TesterFeedback';
import DaddyMail from './DaddyMail';

const rooms = {
  Daddy: {
    image: require('../assets/characters/daddy-neighborhood-feedback.png'),
    aspectRatio: 3 / 2,
    spots: [
      ['Open Daddy’s laptop to email him', 'email', 3, 66, 24, 32],
      ['Open Daddy’s budget notebook', 'Budget', 27, 61, 26, 23],
      ['Open Daddy’s suggestion box', 'feedback', 53, 59, 24, 34],
    ],
  },
  Annie: {
    image: require('../assets/characters/annie-interactive-house.jpg'),
    hint: 'Tap the books, family portraits, quilt, or mailbox.',
    spots: [
      ['Visit Annie’s Neighborhood Library', 'library', 7, 9, 32, 33],
      ['Open the family wall', 'family', 60, 8, 34, 32],
      ['Open the belonging quilt', 'quilt', 6, 58, 33, 32],
      ['Visit Billiam’s mailbox outside', 'Billiam', 62, 56, 32, 34],
    ],
  },
  Bobbie: {
    image: require('../assets/characters/bobbie-interactive-boutique.jpg'),
    hint: 'Tap the smart mirror, bookshelf, or framed photo.',
    spots: [
      ["Visit Bobbie's house and smart mirror", 'mirror', 5, 13, 36, 43],
      ['Visit Annie’s Neighborhood Library', 'library', 65, 11, 30, 32],
      ['Read Bobbie’s story', 'story', 66, 43, 30, 31],
    ],
  },
  Westley: {
    image: require('../assets/characters/westley-interactive-den.jpg'),
    hint: 'Tap the garden door, books, bills, grooming bag, or photo.',
    spots: [
      ['Take a breath in the Calm Garden', 'Calm', 5, 7, 32, 30],
      ['Visit Annie’s Neighborhood Library', 'library', 62, 7, 33, 34],
      ['Check the bills with Westley', 'Bills', 5, 39, 30, 23],
      ['Visit Em’s Pet Spa', 'Spa', 6, 65, 31, 29],
      ['Read Westley’s story', 'story', 65, 42, 32, 31],
    ],
  },
  Tate: {
    image: require('../assets/characters/tate-interactive-hangout.jpg'),
    hint: 'Tap the small-steps board, bookshelf, or framed photo.',
    spots: [
      ['Open Tate’s small steps', 'steps', 5, 11, 35, 39],
      ['Visit Annie’s Neighborhood Library', 'library', 64, 10, 31, 33],
      ['Read Tate’s story', 'story', 69, 43, 27, 33],
    ],
  },
  Chapo: {
    image: require('../assets/characters/chapo-interactive-kitchen.jpg'),
    hint: 'Tap the fridge calendar, bookshelf, notebook, or photo.',
    spots: [
      ['Fridge calendar · Open the extra-paycheck calendar', 'Calendar', 8, 12, 30, 30],
      ['Bookshelf · Visit Annie’s Neighborhood Library', 'library', 63, 12, 29, 30],
      ['Counter notebook · Make room in my budget', 'Budget', 6, 52, 37, 26],
      ['Framed photo · Read Chapo’s story', 'story', 68, 46, 27, 27],
    ],
  },
};

const spotCaptions = {
  library: 'Library', family: 'Family Wall', quilt: 'Quilt', Billiam: 'Mailbox', mirror: 'Smart Mirror',
  story: 'My Story', Calm: 'Calm Garden', Bills: 'Review Bills', Spa: 'Pet Spa', steps: 'Small Steps',
  Calendar: 'Extra Payday', Budget: 'Budget',
  email: 'Email Daddy', feedback: 'Beta Feedback',
};

export default function NeighborRoom({ destination, finance, onHome, onNavigate, onMirrorAction, onStepsChange, onLibraryChange, onQuiltMilestone }) {
  const [story, setStory] = useState(null);
  const [quilt, setQuilt] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const title = neighborhoodLabel(destination);
  const neighbor = FAMILY_STORIES.find(person => person.id === destination.toLowerCase());
  const room = rooms[destination];
  const showRoom = !panel || panel === 'mirror';
  const isDaddy = destination === 'Daddy';

  function open(target) {
    if (target === 'email') setMailOpen(true);
    else if (target === 'feedback') setFeedback(true);
    else if (target === 'quilt') setQuilt(true);
    else if (target === 'story') setStory(neighbor);
    else if (['library', 'family', 'steps', 'mirror'].includes(target)) setPanel(target);
    else onNavigate(target);
  }

  return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to Neighborhood" style={s.back} onPress={onHome}><Text style={s.backText}>‹ Back to the neighborhood</Text></TouchableOpacity>
    {showRoom ? <>
      <Text accessibilityRole="header" style={s.title}>{title}</Text>
      {destination === 'Bobbie' && <Text style={s.body}>High maintenance, not high and mighty.</Text>}
      <InteractiveRoom source={room.image} aspectRatio={room.aspectRatio} testID="neighbor-room-artwork"
        artwork={isDaddy ? <View pointerEvents="none" accessible={false} style={s.laptopFrame}>
          <Image source={require('../assets/characters/daddy-workshop-laptop.png')} style={s.laptop} resizeMode="contain" accessible={false} />
        </View> : destination === 'Annie' && <><AnnieRoomPortraits /><ChairQuilt finance={finance} /></>}
        destinations={room.spots.map(([label, target, x, y, width, height]) => ({
        label, caption: spotCaptions[target],
        area: { left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${height}%` }, open: () => open(target),
      }))}>
        <EncouragementSpot place="room" style={{ left: '49%', top: '91%' }} />
      </InteractiveRoom>
      {room.hint && <Text style={s.body}>{room.hint}</Text>}
      {isDaddy && <FacebookNeighborhood />}
      <RoomVisitors destination={destination} />
      {destination !== 'Annie' && <LibraryReader value={finance.neighborhoodLibrary} destination={destination} onNavigate={onNavigate} onChange={onLibraryChange} showLibraryLink={false} />}
    </> : <>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Back to ${title}`} style={s.back} onPress={() => setPanel(null)}><Text style={s.backText}>‹ {title}</Text></TouchableOpacity>
      {panel === 'library' && <NeighborhoodLibrary value={finance.neighborhoodLibrary} onChange={onLibraryChange} onNavigate={onNavigate} />}
      {panel === 'family' && <FamilyWall onSelect={setStory} />}
      {panel === 'steps' && <SmallSteps finance={finance} onChange={onStepsChange} onOpen={onNavigate} />}
    </>}
    {destination === 'Bobbie' && <BobbieSmartMirror open={panel === 'mirror'} onVisibilityChange={visible => setPanel(visible ? 'mirror' : null)}
      finance={finance} onAction={onMirrorAction} onBudget={() => onNavigate('Budget')} />}
    <Modal visible={!!story || quilt} onRequestClose={() => { setStory(null); setQuilt(false); }} animationType="slide">
      <SafeAreaView style={s.screen}>{quilt ? <QuiltDetail finance={finance} onMilestone={onQuiltMilestone} backLabel="Back to Annie’s House" onBack={() => setQuilt(false)} /> : story && <CharacterStory person={story} backLabel={`Back to ${title}`} onBack={() => setStory(null)} />}</SafeAreaView>
    </Modal>
    {feedback && <TesterFeedback onClose={() => setFeedback(false)} />}
    {mailOpen && <DaddyMail onClose={() => setMailOpen(false)} />}
  </ScrollView>;
}

const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#FFF8F2' }, content: { padding: 18, paddingBottom: 28, gap: 12 },
  back: { minHeight: 48, justifyContent: 'center' }, backText: { color: '#6550AF', fontWeight: '800', fontSize: 15 },
  title: { color: '#173557', fontWeight: '900', fontSize: 28 }, body: { color: '#34465E', fontSize: 16, lineHeight: 24 },
  laptopFrame: { position: 'absolute', left: '3%', top: '69%', width: '23%', height: '27%' },
  laptop: { width: '100%', height: '100%' },
});
