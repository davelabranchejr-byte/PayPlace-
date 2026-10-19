import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CharacterArtwork from './CharacterArtwork';
import FamilyWall, { CharacterStory, FAMILY_STORIES } from './FamilyWall';
import BelongingQuilt, { QuiltDetail } from './BelongingQuilt';
import BobbieSmartMirror from './BobbieSmartMirror';
import { SmallSteps } from './NeighborCare';
import { buildingArtwork } from './NeighborhoodNav';
import { neighborhoodLabel } from './neighborhood-destinations.mjs';
import NeighborhoodLibrary, { LibraryReader } from './NeighborhoodLibrary';

const introductions = {
  Annie: 'The red door is open. Come inside, meet the family, and see the quilt that makes room for everyone.',
  Bobbie: 'A little wardrobe magic, a little confidence, and room for a treat that fits your plan.',
  Westley: 'You can set the heavy stuff down here. Westley will help you find your next gentle step.',
  Tate: 'Small bites, big heart. Pick one little thing with Tate and celebrate showing up.',
  Chapo: 'Everyone deserves a place at the table. Let’s plan a little breathing room for your next extra paycheck.',
};

export default function NeighborRoom({ destination, finance, upcomingTotal, onHome, onNavigate, onMirrorAction, onExtraPaycheckAction, onStepsChange, onLibraryChange }) {
  const [story, setStory] = useState(null);
  const [quilt, setQuilt] = useState(false);
  const title = neighborhoodLabel(destination);
  const neighbor = FAMILY_STORIES.find(person => person.id === destination.toLowerCase());
  const action = (label, target) => <TouchableOpacity key={target} accessibilityRole="button" style={s.action} onPress={() => onNavigate(target)}><Text style={s.actionText}>{label}</Text></TouchableOpacity>;
  return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to Neighborhood" style={s.back} onPress={onHome}><Text style={s.backText}>‹ Back to the neighborhood</Text></TouchableOpacity>
    <CharacterArtwork source={buildingArtwork(destination)} style={s.building} resizeMode="contain" accessibilityLabel={title} />
    <Text accessibilityRole="header" style={s.title}>{title}</Text>
    <Text style={s.body}>{introductions[destination]}</Text>
    {destination === 'Annie' && <>
      {action('Visit Billiam’s mailbox outside', 'Billiam')}
      <NeighborhoodLibrary value={finance.neighborhoodLibrary} onChange={onLibraryChange} onNavigate={onNavigate} />
      <FamilyWall onSelect={setStory} />
      <BelongingQuilt onOpen={() => setQuilt(true)} />
    </>}
    {destination !== 'Annie' && <LibraryReader value={finance.neighborhoodLibrary} destination={destination} onNavigate={onNavigate} onChange={onLibraryChange} />}
    {destination === 'Bobbie' && <BobbieSmartMirror finance={finance} onAction={onMirrorAction} onBudget={() => onNavigate('Budget')} />}
    {destination === 'Westley' && <View style={s.actions}>
      {action('Take a breath in the Calm Garden', 'Calm')}
      {action('Check the bills with Westley', 'Bills')}
      {action('Visit Em’s Pet Spa', 'Spa')}
    </View>}
    {destination === 'Tate' && <SmallSteps finance={finance} onChange={onStepsChange} onOpen={onNavigate} />}
    {destination === 'Chapo' && <>
      <TouchableOpacity accessibilityRole="button" style={s.action} onPress={() => onNavigate('Calendar')}><Text style={s.actionText}>Open the extra-paycheck calendar</Text></TouchableOpacity>
      {action('Make room in my budget', 'Budget')}
    </>}
    {neighbor && destination !== 'Annie' && <TouchableOpacity accessibilityRole="button" onPress={() => setStory(neighbor)} style={s.storyButton}><Text style={s.backText}>Read {neighbor.name}’s story</Text></TouchableOpacity>}
    <Modal visible={!!story || quilt} onRequestClose={() => { setStory(null); setQuilt(false); }} animationType="slide">
      <SafeAreaView style={s.screen}>{quilt ? <QuiltDetail onBack={() => setQuilt(false)} /> : story && <CharacterStory person={story} backLabel={`Back to ${title}`} onBack={() => setStory(null)} />}</SafeAreaView>
    </Modal>
  </ScrollView>;
}

const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#FFF8F2' }, content: { padding: 18, paddingBottom: 28, gap: 12 },
  back: { minHeight: 48, justifyContent: 'center' }, backText: { color: '#6550AF', fontWeight: '800', fontSize: 15 }, building: { alignSelf: 'center', width: 180, height: 150 },
  title: { color: '#173557', fontWeight: '900', fontSize: 28 }, body: { color: '#34465E', fontSize: 16, lineHeight: 24 }, actions: { gap: 10 },
  action: { borderRadius: 15, padding: 16, minHeight: 48, backgroundColor: '#6550AF' }, actionText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' }, storyButton: { backgroundColor: '#EEE8FC', padding: 16, borderRadius: 15, minHeight: 48 },
});
