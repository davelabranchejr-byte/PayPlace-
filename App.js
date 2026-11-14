import { MascotTouchable as TouchableOpacity } from './src/MascotTouchable';
/*
  PAYPLACE PERMANENT CHARACTER LOCK
  Westley: locked West Highland Terrier.
  Bobbie: locked glamorous tabby cat.
  Tate: locked Chihuahua, never a corgi.
  Mr. Chapo: locked orange tabby Reward Goblin.
  Great Annie: locked bark-faced oak with white-flower-and-leaf hair.

  Core species, facial structure, fur pattern, body proportions, and identity
  may never change. Expressions, clothing, accessories, wigs, hair, and nails
  may change. Every animal character must always be fully clothed.
*/


import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppState, Image, Modal, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text, TextInput } from "./src/Privacy";
import { Ionicons } from "@expo/vector-icons";
import ProtectedStorage from "./src/secure-storage";
import AppSecurity, { useAppSecurity } from "./src/AppSecurity";
import { lockAsync, OrientationLock } from "expo-screen-orientation";
import SecuritySettings from "./src/SecuritySettings";
import useBillReminders from "./src/useBillReminders";
import { deletedItems, deleteEntry, restoreEntry } from "./src/deleted-items.mjs";
import Alert from "./src/alert";
import CharacterArtwork from "./src/CharacterArtwork";
import MapRotationCue from "./src/MapRotationCue";
import { EncouragementProvider } from "./src/Encouragement";
import { portraits, annieArtwork } from "./src/characters";
import BankConnections, { isBankOAuthReturn } from "./src/BankConnections";
import MerchantCategories, { CategoryEntry } from "./src/MerchantCategories";
import { demoBankAction } from "./src/bank-activity.mjs";
import EmailVerification from "./src/EmailVerification";
import { hasVerifiedContact } from "./src/contact-verification.mjs";
import { canEnterNeighborhood, onboardingPosition, onboardingDraft, completedProfile, restoredProfile } from "./src/onboarding-progress.mjs";
import FamilyWall, { CharacterStory } from "./src/FamilyWall";
import BelongingQuilt, { AcornSquare, QuiltDetail } from "./src/BelongingQuilt";
import CalmGardenScene, { CalmGardenStory } from "./src/CalmGardenScene";
import { RoomDestinations } from "./src/InteractiveRoom";
import useNeighborhoodArtwork from "./src/useNeighborhoodArtwork";
import NeighborCare, { SmallSteps } from "./src/NeighborCare";
import useAnnieCare from "./src/useAnnieCare";
import { recordActivity } from "./src/neighborhood-progress.mjs";
import { awardQuiltMilestone, keepQuiltMilestones } from "./src/quilt-milestones.mjs";
import LivingNeighborhood, { NeighborhoodTownLife } from "./src/LivingNeighborhood";
import useNeighborhoodWeather from "./src/useNeighborhoodWeather";
import { RoomVisitors } from "./src/NeighborhoodWorld";
import PetSpa from "./src/PetSpa";
import NeighborhoodNav, { buildingArtwork, spaPorchArtwork } from "./src/NeighborhoodNav";
import { NEIGHBOR_DESTINATIONS } from "./src/neighborhood-destinations.mjs";
import BankWelcomeCard from "./src/BankWelcomeCard";
import SeasonalWelcome, { NeighborhoodOpening } from "./src/SeasonalWelcome";
import { neighborhoodWelcomeTheme } from "./src/neighborhood-time.mjs";
import useNeighborhoodClock from "./src/useNeighborhoodClock";
import FittedArtwork from "./src/FittedArtwork";
import FeatureLinks from "./src/FeatureLinks";
import NavigationTiles from "./src/NavigationTiles";
import ActionArtwork from "./src/ActionArtwork";
import ExpandableSection from "./src/ExpandableSection";
import EntrySheet from "./src/EntrySheet";
import BilliamHome, { BilliamShortcut } from "./src/BilliamHome";
import { recordBilliamReadings, reviewedBreakdown } from "./src/billiam-tools.mjs";
import NeighborRoom from "./src/NeighborRooms";
import { advanceReadingCircle } from "./src/neighborhood-library.mjs";
import { neighborhoodLabel } from "./src/neighborhood-destinations.mjs";
import ExtraPaycheckChapoScene from "./src/ExtraPaycheckChapoScene";
import ExtraPaycheckCalendar from "./src/ExtraPaycheckCalendar";
import SubscriptionDetective from "./src/SubscriptionDetective";
import PremiumResilienceHub from "./src/PremiumResilienceHub";
import PayPlacePlans, { plans as payPlacePlans } from "./src/PayPlacePlans";
import BobbieBankDemoLogin from "./src/BobbieBankDemoLogin";
import PrivacyLinks from './src/PrivacyLinks';
import { clearDeviceRecords } from './src/device-deletion';
import { normalizePremiumState } from "./src/premium-resilience.mjs";
import { normalizePremiumBeta } from "./src/premium-beta.mjs";
import useSubscriptionReminders from "./src/useSubscriptionReminders";
import { subscriptionCases, updateSubscription } from "./src/subscription-detective.mjs";
import TesterFeedback from "./src/TesterFeedback";
import BobbieCabaret from "./src/BobbieCabaret";
import ScreenHelp from "./src/ScreenHelp";
import SavingsGoals from "./src/SavingsGoals";
import { addBonus, saveSplit, nextExtraPaycheck, readDate, scheduleSettings, suggestedSplit, buildCalendar } from "./src/paycheck-calendar.mjs";
import PayPlaceBrand from "./src/PayPlaceBrand";
import DebtMethodComparison from "./src/DebtMethodComparison";
import MonthlyPaymentCalendar from "./src/MonthlyPaymentCalendar";
import MoneyOutlook from "./src/MoneyOutlook";
import Micropayments, { MicropaymentsButton } from "./src/Micropayments";
import { recordMicropayment, undoMicropayment } from "./src/micropayments.mjs";
import { STRATEGY_ORDER, normalizeStrategy, orderDebts, selectStrategy, initializeMixedTarget } from "./src/debt-strategies.mjs";
import { mirrorBudget, recordTreat, saveFunMoney, saveLook, undoTreat } from "./src/smart-mirror.mjs";
const lockedWestley = portraits.westley;
const lockedBobbie = portraits.bobbie;
const lockedTate = portraits.tate;
const lockedChapo = portraits.chapo;
const lockedAnnie = portraits.annie;

const pearlCollections = {
  westley: { label: "Westley", subtitle: "Pearls of Protection", pearls: [
    {
      id: "westley-01",
      number: "01",
      title: "Start with one step",
      body: "You do not need the whole map today. Choose the next kind step and begin.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-02",
      number: "02",
      title: "Watch before you decide",
      body: "Pause long enough to see what is really happening before your money moves.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-03",
      number: "03",
      title: "Your future self thanks you",
      body: "A small choice today can leave tomorrow-you a little more room to breathe.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-04",
      number: "04",
      title: "Small choices add up",
      body: "Steady stones build strong paths. Tiny progress still counts.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-05",
      number: "05",
      title: "Guard one small goal",
      body: "Choose one priority and keep it safe today.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-06",
      number: "06",
      title: "Progress, not perfection",
      body: "Done with care beats perfect plans that never leave the chalkboard.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-07",
      number: "07",
      title: "Rainy days happen",
      body: "A hard day is weather, not a verdict. Protect yourself and keep walking.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-08",
      number: "08",
      title: "Ask for help",
      body: "Strong neighbors share the load. You were never meant to carry everything alone.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-09",
      number: "09",
      title: "Plan, then play",
      body: "Give your money a simple job, then make room for joy.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-10",
      number: "10",
      title: "Protect your peace",
      body: "A plan should protect your life, not consume it.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-11",
      number: "11",
      title: "Comparison steals joy",
      body: "Your path only needs to fit your life. Let somebody else keep theirs.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-12",
      number: "12",
      title: "Keep your why close",
      body: "Remember what your money is helping you protect: freedom, family, and a life that feels like yours.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-13",
      number: "13",
      title: "Celebrate small wins",
      body: "A tiny victory is still a victory. Wag first, measure later.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-14",
      number: "14",
      title: "Be kind to yourself",
      body: "You are learning, not failing. Speak to yourself like someone worth protecting.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-15",
      number: "15",
      title: "Let go of what drains you",
      body: "Not every expense, habit, or expectation deserves a permanent place in your life.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    },
    {
      id: "westley-16",
      number: "16",
      title: "Tomorrow is a new day",
      body: "Rest, reset, and begin again. You are always welcome home.",
      signature: "Westley",
      image: portraits.westley,
      imageLabel: portraits.westley.label,
    }
  ] },
  tate: { label: "Tate", pearls: [
    {
      id: "tate-01",
      title: "Adventure is everywhere",
      body: "A fresh start can begin with one ordinary Tuesday.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-02",
      title: "Say yes to new things",
      body: "Try one money habit before deciding it is not for you.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-03",
      title: "Pockets are for treasures",
      body: "Save a little joy for later.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-04",
      title: "Curiosity leads to magic",
      body: "Ask where the money went without blaming yourself.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-05",
      title: "Mud makes memories",
      body: "Messy progress is still a real life being lived.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-06",
      title: "Climb higher, safely",
      body: "Stretch the goal, not your nervous system.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-07",
      title: "Explore with joy",
      body: "Make learning your money feel like discovery.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-08",
      title: "Make friends anywhere",
      body: "Build support before you need rescue.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-09",
      title: "Collect happy moments",
      body: "A budget should leave room for living.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-10",
      title: "No path? Make one",
      body: "Create a method that fits your brain.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-11",
      title: "Splash often",
      body: "Celebrate progress before racing to the next task.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-12",
      title: "Imagination has no limits",
      body: "Your future can look different from your past.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-13",
      title: "Be brave, not perfect",
      body: "Take the step while your knees are still wobbling.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-14",
      title: "Celebrate the little wins",
      body: "Ten dollars saved deserves a tail wag.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-15",
      title: "Every day is a new quest",
      body: "Yesterday does not own today.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
    {
      id: "tate-16",
      title: "Life is for living",
      body: "The plan serves your life, not the other way around.",
      image: portraits.tate,
      imageLabel: portraits.tate.label,
    },
  ] },
  bobbie: { label: "Bobbie", pearls: [
    {
      id: "bobbie-01",
      title: "Confidence is your best outfit",
      body: "Wear the decision before the doubt talks you out of it.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-02",
      title: "Walk like you own it",
      body: "Take up space in your own financial life.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-03",
      title: "You are the main character",
      body: "Your goals do not need anyone else\u2019s approval.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-04",
      title: "Stand tall, whiskers high",
      body: "A mistake is information, not an identity.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-05",
      title: "Your vibe attracts your tribe",
      body: "Choose people who celebrate your growth.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-06",
      title: "Elegance is an attitude",
      body: "Calm choices can still be powerful choices.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-07",
      title: "Never dull your sparkle",
      body: "Do not shrink your dreams to match a rough month.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-08",
      title: "Set trends, do not chase them",
      body: "Build a budget around your values, not appearances.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-09",
      title: "Puuuurfect is a mindset",
      body: "Progress becomes glamorous when it is yours.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-10",
      title: "Be bold. Be you.",
      body: "Name the goal you actually want.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-11",
      title: "Take up space",
      body: "Put your needs in the budget too.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-12",
      title: "Do not seek approval",
      body: "A healthy boundary is always in season.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-13",
      title: "Beauty is power",
      body: "Make your surroundings support the person you are becoming.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-14",
      title: "Invest in you",
      body: "Time, rest, and learning belong in the plan.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-15",
      title: "Slay the day",
      body: "Finish one useful task and let it count.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
    {
      id: "bobbie-16",
      title: "Leave a little sparkle everywhere",
      body: "Encourage somebody after encouraging yourself.",
      image: portraits.bobbie,
      imageLabel: portraits.bobbie.label,
    },
  ] },
  chapo: { label: "Chapo", pearls: [
    {
      id: "chapo-01",
      title: "Snacks are self-care",
      body: "Plan the treat so joy does not have to sneak in.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-02",
      title: "Naps are necessary",
      body: "Rest is productive maintenance.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-03",
      title: "Comfort is productive",
      body: "A safe nervous system makes clearer choices.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-04",
      title: "Treats fix everything-ish",
      body: "A reward helps, but future you still needs a plan.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-05",
      title: "A full belly, happy heart",
      body: "Meet the basic need before solving the big problem.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-06",
      title: "Slow down, buddy",
      body: "Urgency is not always truth.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-07",
      title: "Find your cozy spot",
      body: "Create one place where money tasks feel less threatening.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-08",
      title: "It is okay to rest",
      body: "Pausing is not quitting.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-09",
      title: "Gratitude fills the bowl",
      body: "Notice what is working while repairing what is not.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-10",
      title: "Water, snacks, repeat",
      body: "Simple care can prevent dramatic decisions.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-11",
      title: "Belly rubs help",
      body: "Accept comfort when the day feels sharp.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-12",
      title: "Good vibes only-ish",
      body: "Feel the hard thing, then choose one helpful action.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-13",
      title: "Home is where the snacks are",
      body: "Safety is a valid financial goal.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-14",
      title: "Laugh daily",
      body: "Humor can loosen shame\u2019s grip.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-15",
      title: "Life is better with cookies",
      body: "Leave room for pleasure without abandoning tomorrow.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
    {
      id: "chapo-16",
      title: "Be kind to your soul",
      body: "You are not a problem to be fixed.",
      image: portraits.chapo,
      imageLabel: portraits.chapo.label,
    },
  ] },
together: { label: "Annie", subtitle: "Great Annie's Calm Garden", pearls: [
    {
      id: "together-01",
      number: "01",
      title: "Water what you want to grow",
      body: "Give your attention to the part of your money life you want to strengthen, not the part that already knows how to scare you.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Great Annie watering the PayPlace Calm Garden in the morning",
    },
    {
      id: "together-02",
      number: "02",
      title: "You can sit down here",
      body: "Rest is not falling behind. Sometimes the smartest money move is giving your nervous system a minute before making another decision.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Great Annie beside a quiet garden bench",
    },
    {
      id: "together-03",
      number: "03",
      title: "One seed is enough",
      body: "You do not need to rebuild everything today. Plant one useful habit and let it become something sturdy.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Great Annie planting one small seed in the Calm Garden",
    },
    {
      id: "together-04",
      number: "04",
      title: "Follow the next stone",
      body: "When the whole path feels impossible, choose the next clear step. The rest of the garden can wait.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Great Annie beside a stepping-stone path through the garden",
    },
    {
      id: "together-05",
      number: "05",
      title: "Night does not mean lost",
      body: "You do not need daylight to know where home is. A little light and the next safe step are enough.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Great Annie in the night garden with fireflies and stars",
    },
    {
      id: "together-06",
      number: "06",
      title: "Make room for sweetness",
      body: "A plan that never allows joy is not a very good plan. Make the s'mores. Put fun in the budget on purpose.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "The PayPlace family making s'mores around a garden campfire",
    },
    {
      id: "together-07",
      number: "07",
      title: "Listen before you fix",
      body: "Not every money feeling is asking for a spreadsheet. Sometimes it is asking to be noticed without being judged.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Great Annie listening in the quiet morning garden",
    },
    {
      id: "together-08",
      number: "08",
      title: "The garden changes",
      body: "A rough season is still a season. Your plan is allowed to change when your life changes.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Great Annie standing among changing plants in the Calm Garden",
    },
    {
      id: "together-09",
      number: "09",
      title: "Protect the roots",
      body: "Cover the essentials first. Roots do their best work where nobody applauds them.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Great Annie tending deep roots and garden beds",
    },
    {
      id: "together-10",
      number: "10",
      title: "Let the birds be loud",
      body: "Your thoughts can make noise without becoming instructions. Notice them, then choose what actually deserves action.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Birds flying around Great Annie as she waters the garden",
    },
    {
      id: "together-11",
      number: "11",
      title: "Bring it to the fire",
      body: "Hard conversations get easier when nobody is pretending. Sit together, tell the truth, and keep the marshmallows nearby.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "The PayPlace family gathered around the Calm Garden campfire",
    },
    {
      id: "together-12",
      number: "12",
      title: "A lantern is enough",
      body: "You do not need certainty. You need enough information to make the next responsible choice.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Great Annie beside lantern light in the evening garden",
    },
    {
      id: "together-13",
      number: "13",
      title: "Prune without shame",
      body: "Something can have been right for you once and still be ready to leave the budget now.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Great Annie gently pruning the Calm Garden",
    },
    {
      id: "together-14",
      number: "14",
      title: "Grow at your speed",
      body: "Nobody yells at a garden for not blooming on somebody else's schedule. Your money life gets the same courtesy.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Great Annie surrounded by plants at different stages of growth",
    },
    {
      id: "together-15",
      number: "15",
      title: "Come back to the porch",
      body: "When the numbers start feeling bigger than you are, return to what is true: what you have, what is due, and what can wait.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Great Annie welcoming the user back toward the Calm Garden porch",
    },
    {
      id: "together-16",
      number: "16",
      title: "You still belong here",
      body: "A bad month does not revoke your place in the neighborhood. Come home, make a plan, and begin again.",
      signature: "Great Annie",
      image: portraits.annie,
      imageLabel: "Great Annie welcoming the PayPlace family home beneath a starry sky",
    },
  ] },
    
};
const pearlCategoryOrder = ['westley','tate','bobbie','chapo','together'];


const STORAGE_KEY = "@payplace_finance_v5_manual_mode";
const ONBOARDING_KEY = "@payplace_onboarding_v3_annie_first";
const neighborhoodScene = require("./assets/characters/annie-red-door-village.png");
// Welcome, red door, and foyer share Dave's original canonical Annie.
import LaunchEssentials from "./src/LaunchEssentials";
import { PrivacyContext } from "./src/Privacy";
import { paydaySnapshot, recordBillHistory, undoPayment, firstWinPlan, emptyPlan, samplePlan, quietSettings } from "./src/launch-essentials.mjs";
const greatAnnieHero = annieArtwork.welcome;
const addDebtMascotsGraphic = require("./assets/characters/add-debt-family-budget.png");
const snowballBuddyGraphic = require("./assets/characters/857054EA-5272-487D-BDD7-1F4ABE1F9DCA.png");
const avalancheBuddyGraphic = require("./assets/characters/IMG_3610.png");
const mixedBuddyGraphic = require("./assets/characters/debt-mixed-snowplow.png");
const safeSpendPetStoreGraphic = portraits.together;

const addBillTateGraphic = require("./assets/characters/bills-tate-convertible.jpg");
const importBillsWestleyGraphic = require("./assets/characters/sample-bills-westley-mailman.png");
const manualModeDriveGraphic = require("./assets/characters/manual-mode-tate-convertible.png");

const overwhelmedWestleyGraphic = require("./assets/characters/overwhelmed-westley-cozy.jpg");
const calmPearlImage1 = portraits.together;
const calmPearlImage2 = portraits.together;
const calmPearlImage3 = portraits.together;
const calmPearlImage4 = portraits.together;
const calmPearlImage5 = portraits.together;
const calmPearlImage6 = portraits.together;
function imageSource(image) {
  return typeof image === "string" ? { uri: image } : image;
}


const NEIGHBORHOOD_POSTERS = [
  {
    mascot: "Bobbie",
    quote: "Money without shame.",
    sub: "Everyone belongs in the neighborhood.",
    image: lockedBobbie,
    accent: "#FF7F73",
    soft: "#FFF0ED",
  },
  {
    mascot: "Westley",
    quote: "Progress over perfection.",
    sub: "Crooked steps still move forward.",
    image: require("./assets/characters/snapshot-calm-reset.png"),
    accent: "#7A5CE6",
    soft: "#F0EBFF",
  },
  {
    mascot: "Tate",
    quote: "One small step is enough.",
    sub: "Gentle progress is real progress.",
    image: require("./assets/characters/nav-calm-garden.png"),
    accent: "#0FAF9D",
    soft: "#E3FBF6",
  },
  {
    mascot: "Chapo",
    quote: "Rest is part of the plan.",
    sub: "The neighborhood will still be here.",
    image: portraits.chapo,
    accent: "#F4B72E",
    soft: "#FFF7D8",
  },
  {
    mascot: "The PayPlace Neighbors",
    quote: "We’ll figure it out together.",
    sub: "No lectures. No shame spiral. Just the next step.",
    image: calmPearlImage2,
    accent: "#19A9D8",
    soft: "#E7F8FF",
  },
  {
    mascot: "Westley & Tate",
    quote: "Showing up counts.",
    sub: "Opening the app was already a win.",
    image: require("./assets/characters/showing-up-counts-westley-tate.jpg"),
    accent: "#FF6E83",
    soft: "#FFF0F4",
  },
  {
    mascot: "Bobbie",
    quote: "Confidence compounds.",
    sub: "Clarity first. Courage second.",
    image: require("./assets/characters/nav-budget-studio.png"),
    accent: "#6E56CF",
    soft: "#F1EDFF",
  },
];

const NEIGHBORHOOD_GREETING = [
  "The porch light is on, and the family saved your place.",
  "The neighbors saved you a sunny seat.",
  "Westley says the path is mostly clear.",
  "Tate put the kettle on.",
  "Bobbie has the plan. Chapo has the hammock.",
  "You came home. That is enough for today.",
  "No judgment at Annie’s red door. Come on in.",
];

function getNeighborhoodDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / 86400000);
}

const palette = {
  bg: "#F6FBFF",
  card: "#FFFFFF",
  ink: "#071A3A",
  navy: "#111B2A",
  muted: "#697386",
  mint: "#23E0C6",
  mintBright: "#5FFFD7",
  mintDark: "#10BFAE",
  teal: "#11B8A7",
  aqua: "#DFFCF7",
  purple: "#8435CB",
  lavender: "#EAC5FF",
  coral: "#FF6464",
  coralDark: "#EF4444",
  blush: "#FFF0F0",
  gold: "#FFE344",
  goldDark: "#E8A900",
  blue: "#21B7E8",
  border: "#DDEAF4",
  snowball: "#60A5FA",
  snowballSoft: "#DBEAFE",
  snowballDark: "#2563EB",
  avalanche: "#A5F3FC",
  avalancheSoft: "#ECFEFF",
  avalancheDark: "#0891B2",
};

const cardThemes = {
  gold: { background: palette.gold, border: "#D09A00", text: palette.ink },
  coral: { background: "#FF8585", border: "#CF4747", text: palette.ink },
  sky: { background: "#8CDEFF", border: "#1484AF", text: palette.ink },
  purple: { background: palette.purple, border: "#C5BBFF", text: "#FFFFFF" },
  mint: { background: palette.mintBright, border: "#087E70", text: palette.ink },
  teal: { background: palette.teal, border: "#087E70", text: palette.ink },
};

const DEMO_IMPORTED_BILLS = [
  {
    id: "bill_001",
    name: "Potomac Edison",
    amount: "142.38",
    dueDate: "2026-06-15",
    frequency: "Monthly",
    paid: false,
    paymentMethod: "Manual",
    paymentAddress: "Demo payment address\nPO Box 1234\nBilltown, PA 12345",
    accountNumberLast4: "1234",
    notes: "Detected from checking account",
    source: "Imported demo",
    confidence: "High",
  }
];

const starterFinance = {
  balance: 1900,
  nextPaycheck: 2180,
  daysUntilPayday: 9,
  nextPaycheckDate: "2026-06-10",
  payFrequency: "Biweekly",
  allowance: 38,
  buffer: 150,
  creditScore: 724,
  creditScoreSource: "Manual entry",
  plaidConnected: false,
  linkedInstitution: "Not connected",
  autopilotOn: false,
  overwhelmedCount: 0,
  payoffMode: "snowball",
  mixedQuickWinId: null,
  bills: [

  {

    id: "bill_rent",

    name: "Rent",

    amount: "1200.00",

    dueDate: "2026-06-01",

    frequency: "Monthly",

    paid: false,

    status: "Upcoming",

    due: "2026-06-01",

    paymentMethod: "Manual",

    paymentAddress: "",

    accountNumberLast4: "",

    notes: "",

    source: "Manual",

    confidence: "Confirmed"

  },

  {

    id: "bill_001",

    name: "Potomac Edison",

    amount: "142.38",

    dueDate: "2026-06-15",

    frequency: "Monthly",

    paid: false,

    status: "Upcoming",

    due: "2026-06-15",

    paymentMethod: "Manual",

    paymentAddress: "",

    accountNumberLast4: "",

    notes: "Detected from checking account",

    source: "Imported demo",

    confidence: "High"

  }

],
  debts: [
    { id: "cc1", name: "Credit Card", balance: 2840, apr: 26.9, minimum: 75 },
    { id: "loan1", name: "Personal Loan", balance: 6200, apr: 13.4, minimum: 210 },
    { id: "car1", name: "Car Loan", balance: 11800, apr: 6.2, minimum: 389 },
  ],
};

const legacyCalmPearls = [
  {
    title: "One bill at a time",
    body: "You do not need to fix your whole financial life in one sitting. Pick the next bill, the next action, the next tiny win.",
    image: calmPearlImage1,
    imageLabel: "Westley and Tate planning together in a cozy PayPlace workspace",
  },
  {
    title: "You are not bad with money",
    body: "Overwhelm can make simple tasks feel locked behind a foggy door. PayPlace puts the handle back where you can reach it.",
    image: calmPearlImage2,
    imageLabel: "Westley and Tate sharing a cozy encouraging moment with PayPlace branding",
  },
  {
    title: "Late fees are not a personality flaw",
    body: "They are a system problem. A due date, a reminder, and one clear dashboard can change the whole game.",
    image: calmPearlImage3,
    imageLabel: "Westley and Tate with playful payment treats and PayPlace branding",
  },
  {
    title: "Breathe, then decide",
    body: "Inhale for 4. Hold for 4. Exhale for 6. Your nervous system gets a vote before your budget does.",
    image: calmPearlImage4,
    imageLabel: "Westley resting in a cozy comforting room with PayPlace branding",
  },
  {
    title: "Small payments still count",
    body: "Ten dollars toward debt is not nothing. Paying on time is not nothing. Opening the app instead of avoiding it is definitely not nothing.",
    image: calmPearlImage5,
    imageLabel: "Westley and Tate celebrating a playful payoff plan with PayPlace branding",
  },
  {
    title: "Clarity first, courage second",
    body: "You do not need perfect numbers. You need a place to start. The rest can be sorted one little money tile at a time.",
    image: calmPearlImage6,
    imageLabel: "Tate driving happily with PayPlace branding in logo colors",
  },
];

function money(value) {
  const number = Number(value) || 0;
  return `$${number.toFixed(2)}`;
}

function cleanNumber(value) {
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  const safe = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
  const number = Number(safe);
  return Number.isFinite(number) ? number : 0;
}

function parseDateSafe(value, fallbackDays = 0) {
  if (value) {
    const parsed = new Date(`${value}T12:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const fallback = new Date();
  fallback.setHours(12, 0, 0, 0);
  fallback.setDate(fallback.getDate() + Number(fallbackDays || 0));
  return fallback;
}

function formatMonthYear(date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatShortDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getExtraPaycheckInfo(finance, upcomingTotal, debtDueTotal) {
  const settings = scheduleSettings(finance.payFrequency);
  const extra = nextExtraPaycheck(finance);
  const amount = extra?.amount || Math.max(Number(finance.nextPaycheck) || 0, 0);
  const split = suggestedSplit(amount, upcomingTotal);
  const date = extra ? readDate(extra.date) : null;
  const count = date ? buildCalendar(finance, date).events.filter(event => event.type === "pay").length : 0;
  return {
    hasExtra: Boolean(extra),
    title: extra ? "Extra paycheck alert" : "Extra paycheck radar",
    subtitle: extra ? `${formatMonthYear(date)}: ${extra.label.toLowerCase()} on ${formatShortDate(date)}. Open your calendar to plan it.`
      : readDate(finance.nextPaycheckDate) ? "No extra checks in the next 12 months. Open your calendar to see paydays or add a bonus."
      : "Set your next payday in Budget, then open your calendar to spot extra checks.",
    monthLabel: date ? formatMonthYear(date) : "Not detected",
    count, extraDateLabel: date ? formatShortDate(date) : "Set payday", amount,
    frequencyLabel: settings.label,
    suggestions: [
      { label: "Bills", value: money(split.bills), color: palette.gold, textColor: palette.ink },
      { label: "Debt", value: money(split.debt), color: palette.purple, textColor: "white" },
      { label: "Buffer", value: money(split.buffer), color: palette.mintBright, textColor: palette.ink },
      { label: "Joy", value: money(split.joy), color: palette.coral, textColor: "white" },
    ],
  };
}

function getTellMeWhatToDoPlan({ finance, upcomingTotal, debtDueTotal, safeToSpendDaily, safeToSpend, nextBill, extraPaycheckInfo }) {
  const unpaidBills = finance.bills.filter((bill) => bill.status !== "Paid");
  const overdueBills = unpaidBills.filter((bill) => {
    const dueDate = bill.dueDate || bill.due;
    if (!dueDate || !String(dueDate).includes("-")) return false;
    return parseDateSafe(dueDate) < new Date();
  });
  const hasDebts = finance.debts.length > 0;
  const buffer = Number(finance.buffer || 0);
  const balance = Number(finance.balance || 0);

  if (!balance) {
    return {
      title: "Feed the dashboard first",
      body: "PayPlace needs a few numbers before it can give you a clean next move. This is not homework. It is giving the money gremlin a map.",
      targetTab: "Budget",
      actionLabel: "Open Budget",
      accentColor: palette.blue,
      tintColor: "#DDEEFF",
      icon: "wallet",
      steps: [
        "Add current bank balance.",
        "Add next paycheck amount and payday date.",
        "Add pay frequency so extra-check months can be spotted.",
      ],
    };
  }

  if (overdueBills.length > 0) {
    return {
      title: `Handle ${overdueBills[0].name} first`,
      body: "One bill is already past its date. No shame spiral. Just put this one at the front of the line and make the next move obvious.",
      targetTab: "Bills",
      actionLabel: "Open Bills",
      accentColor: palette.coralDark,
      tintColor: palette.blush,
      icon: "alert-circle",
      steps: [
        `Review ${overdueBills[0].name} and confirm the amount.`,
        "Add payment details if they are missing.",
        "Pay it or mark it paid once handled so Home recalculates.",
      ],
    };
  }

  if (safeToSpendDaily <= 0 && nextBill) {
    return {
      title: `Protect ${nextBill.name}`,
      body: "Safe to Spend is at zero, which means PayPlace is waving the tiny traffic flag. Essentials first. Fun money waits outside with a juice box.",
      targetTab: "Bills",
      actionLabel: "Open Bills",
      accentColor: palette.goldDark,
      tintColor: "#FFF4BC",
      icon: "receipt",
      steps: [
        `Review ${nextBill.name}.`,
        "Confirm unpaid bills and delete anything fake or duplicated.",
        "Update Budget if your balance or paycheck changed.",
      ],
    };
  }

  if (extraPaycheckInfo?.hasExtra) {
    return {
      title: "Plan the extra paycheck",
      body: "PayPlace found an extra check month. That money needs a job before chaos gets a shopping cart.",
      targetTab: "Budget",
      actionLabel: "See Extra Check",
      accentColor: palette.purple,
      tintColor: palette.lavender,
      icon: "sparkles",
      steps: [
        "Cover catch-up bills first.",
        "Push a chunk toward the debt target.",
        "Keep a small guilt-free joy slice so the plan survives contact with real life.",
      ],
    };
  }

  if (hasDebts && debtDueTotal > 0 && safeToSpend > buffer * 0.5) {
    const mode = finance.payoffMode === "mixed" ? "Mixed" : finance.payoffMode === "avalanche" ? "Avalanche" : "Snowball";
    return {
      title: `${mode} is your next focus`,
      body: "You have some breathing room. Aim extra money at the debt plan so the progress becomes visible instead of evaporating.",
      targetTab: "Debt",
      actionLabel: "Open Debt",
      accentColor: finance.payoffMode === "mixed" ? palette.purple : finance.payoffMode === "avalanche" ? palette.avalancheDark : palette.snowballDark,
      tintColor: finance.payoffMode === "mixed" ? palette.lavender : finance.payoffMode === "avalanche" ? palette.avalancheSoft : palette.snowballSoft,
      icon: finance.payoffMode === "mixed" ? "shuffle" : finance.payoffMode === "avalanche" ? "triangle" : "ellipse",
      steps: [
        `Stay in ${mode} mode unless you intentionally switch.`,
        "Pay minimums on everything.",
        "Send extra money to the current target debt.",
      ],
    };
  }

  if (unpaidBills.length > 0 && nextBill) {
    return {
      title: `Check ${nextBill.name}`,
      body: "Nothing is on fire, but the next bill is still waiting. One review now prevents future-you from getting jump-scared.",
      targetTab: "Bills",
      actionLabel: "Go to Bills",
      accentColor: palette.teal,
      tintColor: palette.aqua,
      icon: "checkmark-circle",
      steps: [
        `Review ${nextBill.name}.`,
        "Make sure the details are saved.",
        `Keep spending under ${money(safeToSpendDaily)}/day until payday.`,
      ],
    };
  }

  return {
    title: "Stay steady",
    body: "The dashboard is calm. Keep your buffer protected and avoid turning a good day into mystery spending confetti.",
    targetTab: "Calm",
    actionLabel: "Open Calm",
    accentColor: palette.mintDark,
    tintColor: palette.aqua,
    icon: "leaf",
    steps: [
      `Keep spending around ${money(safeToSpendDaily)}/day.`,
      "Check PayPlace once today.",
      "Do not invent a money emergency out of boredom.",
    ],
  };
}

export default function App() {
  return <AppSecurity><PayPlaceApp /></AppSecurity>;
}

function PayPlaceApp() {
  const { obscured } = useAppSecurity();
  const dataDeletion = useRef(false);
  const [clearingData, setClearingData] = useState(false);
  const [deletionGeneration, setDeletionGeneration] = useState(0);
  const [securityVisible, setSecurityVisible] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [bankConnectionsVisible, setBankConnectionsVisible] = useState(isBankOAuthReturn);
  const [categoriesVisible, setCategoriesVisible] = useState(false);
  const [bankingDemoVisit, setBankingDemoVisit] = useState(0);
  const [tabHelpVisible, setTabHelpVisible] = useState(false);
  const [detectiveVisible, setDetectiveVisible] = useState(false);
  const [cabaretVisible, setCabaretVisible] = useState(false);
  const [savingsVisible, setSavingsVisible] = useState(false);
  const [tab, setTab] = useState("Home");
  const [welcomeSeen, setWelcomeSeen] = useState(false);
  const seeWelcome = useCallback(() => setWelcomeSeen(true), []);
  const [billiamBack, setBilliamBack] = useState("Bills");
  const [calmBack, setCalmBack] = useState("Neighborhood");
  useEffect(() => { if (tab !== "Calm") setCalmBack("Neighborhood"); }, [tab]);
  function openBankingDemo() { setBankingDemoVisit(current => current + 1); setTab("BankingDemo"); }
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [debtEntry, setDebtEntry] = useState({ showMethods: false, back: "Bills" });
  const [savedFinance, setSavedFinance] = useState(starterFinance);
  const [sampleFinance, setSampleFinance] = useState(null);
  const [essentialsPanel, setEssentialsPanel] = useState(null);
  const [micropaymentsVisible, setMicropaymentsVisible] = useState(false);
  const [monthlyCalendarMode, setMonthlyCalendarMode] = useState(null);
  const [extraCalendarVisible, setExtraCalendarVisible] = useState(false);
  const [outlookVisible, setOutlookVisible] = useState(false);
  const finance = sampleFinance || savedFinance;
  const subscriptionPreview = Boolean(sampleFinance);
  function openSubscriptionDetective() {
    if (subscriptionPreview) {
      setDetectiveVisible(true);
      return;
    }
    Alert.alert(
      "Subscription Detective · Paid Premium",
      "Subscription tracking is a paid PayPlace Premium feature. You can try it with sample data in Bobbie’s banking demo. In regular PayPlace, add your subscriptions as bills with their amounts and due dates.",
      [{ text: "Close", style: "cancel" }, { text: "Open my bills", onPress: () => setTab("Bills") }]
    );
  }
  const quiet = quietSettings(finance.quietMode);
  const effectiveBillSettings = useMemo(() => ({...finance.billReminders,
    ...(quiet.hour !== null ? {hour:quiet.hour,minute:quiet.minute} : {}),
    ...(sampleFinance || clearingData ? {enabled:false} : {})}), [finance.billReminders,quiet.hour,quiet.minute,!!sampleFinance,clearingData]);
  const effectiveCareSettings = useMemo(() => ({...finance.annieCare,
    ...(quiet.hour !== null ? {hour:quiet.hour,minute:quiet.minute} : {}),
    ...(quiet.pauseCheckIns || sampleFinance || clearingData ? {weekly:false,checkIn:false} : {})}), [finance.annieCare,quiet.hour,quiet.minute,quiet.pauseCheckIns,!!sampleFinance,clearingData]);
  // Reconcile away old subscription reminders while paid access is unavailable.
  const effectiveSubscriptionSettings = useMemo(() => ({ enabled: false }), []);
  function setFinanceRaw(update) { (sampleFinance ? setSampleFinance : setSavedFinance)(update); }
  function addQuiltSquare(id) {
    if (!sampleFinance) setFinanceRaw(current => awardQuiltMilestone(current, id));
  }

  function changeLibrary(action) {
    setFinanceRaw(current => {
      try {
        return keepQuiltMilestones(current, { ...current, neighborhoodLibrary: action(current.neighborhoodLibrary) });
      } catch { return current; } // A repeated tap cannot check out the same copy twice.
    });
  }
  function setFinance(update) { setFinanceRaw(current => recordActivity(current, recordBillHistory(current, recordBilliamReadings(current, typeof update === "function" ? update(current) : update)))); }
  async function saveCategories(next) {
    if (dataDeletion.current || storageError || !loaded) throw new Error('Your plan is not ready to save. Please try again.');
    if (!sampleFinance) {
      // Confirm encrypted persistence before the category sheet reports success.
      await ProtectedStorage.setItem(STORAGE_KEY, JSON.stringify({ ...savedFinance, categorization: next }));
    }
    setFinance(current => ({ ...current, categorization: next }));
  }
  function updateDemoBank(action) {
    if (!sampleFinance || finance.bankActivity?.source !== 'demo') return false;
    try { setFinance(demoBankAction(finance, action)); return true; }
    catch (error) { Alert.alert('A little bank check', error.message); return false; }
  }
  function startSample() { setSampleFinance({...samplePlan(starterFinance),quietMode:savedFinance.quietMode}); setEssentialsPanel(null);setTab("Home"); }
  function startBankDemo() {
    if (sampleFinance?.bankActivity?.source === 'demo') { openBankingDemo(); return; }
    setSampleFinance({...samplePlan(starterFinance),quietMode:savedFinance.quietMode,
      premiumBeta:{sampleConnected:true,useSamplePlan:true}});
    setExtraCalendarVisible(false);
    setEssentialsPanel(null);
    openBankingDemo();
  }
  function openBilliam(back) {
    setBilliamBack(back);
    setTab("Billiam");
  }

  function openDebt(showMethods, back = "Bills") {
    setDebtEntry({ showMethods, back });
    setTab("Debt");
  }
  function openPlanTool(tool) {
    switch (tool) {
      case "budget": setTab("Budget"); break;
      case "bills": setTab("Bills"); break;
      case "neighborhood": setTab("Neighborhood"); break;
      case "calm": setTab("Calm"); break;
      case "debt": openDebt(true, "Plans"); break;
      case "monthlyCalendar": setMonthlyCalendarMode("view"); break;
      case "printCalendar": setMonthlyCalendarMode("print"); break;
      case "savings": setSavingsVisible(true); break;
      case "micropayments": setMicropaymentsVisible(true); break;
      case "extraCalendar": setExtraCalendarVisible(true); break;
      case "spending": setCategoriesVisible(true); break;
      case "outlook": setOutlookVisible(true); break;
    }
  }
  function endSample() { setExtraCalendarVisible(false);setSampleFinance(null);setDetectiveVisible(false);setEssentialsPanel(null);setTab("Home"); }
  function saveFirstWin(entry) { const next=firstWinPlan(finance,entry);setFinance(next);setEssentialsPanel("payday"); }
  function saveMicropayment(entry, validateOnly = false) {
    const next = recordMicropayment(finance, entry);
    if (!validateOnly) setFinance(next);
  }
  function undoExtraPayment(id) { setFinance(undoMicropayment(finance, id)); }
  function undoRecordedPayment(id) { try {setFinance(undoPayment(finance,id));} catch(e) {Alert.alert("Review this record",e.message);} }
  function correctRecordedPayment(id,amount) { setFinance(current => ({...current,bills:current.bills.map(b=>b.id===id?{...b,amount:amount.toFixed(2)}:b)})); }

  const [calmIndex, setCalmIndex] = useState(0);
  const [pearlCategory, setPearlCategory] = useState("westley");
  const [loaded, setLoaded] = useState(false);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  useEffect(() => {
    if (!loaded || storageError || clearingData) return;
    const rotate = () => setFinanceRaw(current => {
      const next = advanceReadingCircle(current.neighborhoodLibrary);
      return JSON.stringify(next) === JSON.stringify(current.neighborhoodLibrary) ? current : {...current, neighborhoodLibrary: next};
    });
    rotate();
    const timer = setInterval(rotate, 60000);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') rotate(); });
    return () => { clearInterval(timer); listener.remove(); };
  }, [loaded, storageError, clearingData, !!sampleFinance]);
  const [onboardingSession, setOnboardingSession] = useState(0);
  const [revisitingAnnie, setRevisitingAnnie] = useState(false);
  const onboardingFinalizing = useRef(false);
  const onboardingSaveWarning = useRef(false);
  const [onboardingAnswers, setOnboardingAnswers] = useState({
    name: "",
    email: "",
    goal: "",
    moneyFeeling: "",
    challenge: "",
    payFrequency: "",
    connectBank: "Later",
    notes: "",
    arrivalReason: "",
  });
  const onTownMap = tab === "Home" || tab === "Neighborhood";
  const canRotateMap = onTownMap && (onboardingComplete || !!sampleFinance) &&
    !revisitingAnnie && !obscured && !storageError && !bankConnectionsVisible && !securityVisible && !tabHelpVisible && !essentialsPanel && !cabaretVisible;
  const [rotationUnavailable, setRotationUnavailable] = useState(false);
  const orientationRequest = useRef(Promise.resolve());
  useEffect(() => {
    if (Platform.OS === "web") return;
    let current = true;
    orientationRequest.current = orientationRequest.current
      .then(() => lockAsync(canRotateMap ? OrientationLock.DEFAULT : OrientationLock.PORTRAIT_UP))
      .then(() => { if (current) setRotationUnavailable(false); }, () => { if (current) setRotationUnavailable(true); });
    return () => { current = false; };
  }, [canRotateMap]);
  const annieStatus = useAnnieCare(effectiveCareSettings, loaded && onboardingComplete && !storageError && !clearingData, now => setFinanceRaw(current => ({...current, annieCare:{...current.annieCare, lastOpened:now, returnedAfterWeek: !!current.annieCare?.lastOpened && now-current.annieCare.lastOpened >= 7*86400000}})), () => setTab("Home"));
  const reminderStatus = useBillReminders(finance.bills, effectiveBillSettings, loaded && !storageError && !clearingData,
    () => setTab("Bills"));
  const subscriptions = useMemo(() => subscriptionCases(finance), [finance.subscriptions]);
  useSubscriptionReminders(subscriptions, effectiveSubscriptionSettings,
    loaded && onboardingComplete && !storageError && !clearingData, openSubscriptionDetective);
  function updateDetective(action) {
    if (!subscriptionPreview) return false;
    try { setFinance(updateSubscription(finance, action)); return true; }
    catch (error) { Alert.alert("A little detective check", error.message); return false; }
  }
  const recentDeleted = deletedItems(finance);
  function changeReminders(options) {
    setFinance(current => ({ ...current, billReminders: options }));
  }
  function undoDeletion(key) {
    const entry = recentDeleted.find(item => item.key === key);
    if (entry && finance[entry.collection].some(item => item.id === entry.item.id)) {
      Alert.alert("This entry already exists", "PayPlace kept the current entry. Restore will not replace it with an older copy.");
      return;
    }
    setFinance(current => restoreEntry(current, key));
  }

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [saved, savedOnboarding] = await Promise.all([
          ProtectedStorage.getItem(STORAGE_KEY),
          ProtectedStorage.getItem(ONBOARDING_KEY),
        ]);

        if (savedOnboarding && active) {
          const parsedOnboarding = JSON.parse(savedOnboarding);
          setOnboardingAnswers((current) => ({ ...current, ...parsedOnboarding }));
          setOnboardingComplete(canEnterNeighborhood(parsedOnboarding));
        }

        if (saved && active) {
          const parsed = JSON.parse(saved);

          setSavedFinance({
            ...starterFinance,
            ...parsed,
            bills: Array.isArray(parsed.bills) ? parsed.bills : starterFinance.bills,
            debts: Array.isArray(parsed.debts) ? parsed.debts : starterFinance.debts,
            payoffMode: normalizeStrategy(parsed.payoffMode),
          });
        }
        if (!saved && active) setSavedFinance(emptyPlan(starterFinance));
        if (active) setStorageError(false);
      } catch (error) {
        if (active) setStorageError(true);
        return; // Never overwrite an unreadable vault with starter data.
      }
      if (active) {
        setLoaded(true);
        setOnboardingLoaded(true);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [loadAttempt]);

  useEffect(() => {
    if (!loaded || dataDeletion.current) return;

    ProtectedStorage.setItem(STORAGE_KEY, JSON.stringify(savedFinance)).catch(() => {
      Alert.alert("Your changes are not saved yet", "PayPlace could not save this update. Keep the app open and try again, or create an encrypted backup from Security & backup.");
    });
  }, [savedFinance, loaded]);
  useEffect(() => { if (deletionGeneration) dataDeletion.current = false; }, [deletionGeneration]);

  const saveOnboardingProgress = useCallback((profile) => {
    // A queued draft must never overwrite a completed profile. Vault writes are
    // serialized; completion is enqueued after earlier progress writes.
    if (onboardingFinalizing.current || dataDeletion.current) return;
    setOnboardingAnswers(profile);
    ProtectedStorage.setItem(ONBOARDING_KEY, JSON.stringify(profile)).then(() => {
      onboardingSaveWarning.current = false;
    }).catch(() => {
      if (onboardingSaveWarning.current) return;
      onboardingSaveWarning.current = true;
      Alert.alert("Your answers are not saved yet", "Keep PayPlace open and try again. Your previous saved progress has not been replaced.");
    });
  }, []);

  const currentBudget = useMemo(() => mirrorBudget(finance), [finance]);
  const upcomingTotal = currentBudget.bills;
  const debtDueTotal = currentBudget.debt;
  const safeToSpend = currentBudget.available;

  const safeToSpendDaily = useMemo(() => {
    const days = Math.max(Number(finance.daysUntilPayday || 0), 1);
    return safeToSpend / days;
  }, [safeToSpend, finance.daysUntilPayday]);

  function updateNumber(field, text) {
    setFinance((current) => ({
      ...current,
      [field]: cleanNumber(text),
      ...(field === "balance" ? {balanceUpdatedAt:Date.now(),balanceSource:"Manual entry"} : {}),
    }));
  }

  function updateText(field, text) {
    setFinance((current) => ({
      ...current,
      [field]: text,
      ...(field === "nextPaycheckDate" ? {daysUntilPayday:paydaySnapshot({...current,nextPaycheckDate:text}).days ?? 0} : {}),
    }));
  }

  function updateMirror(action) {
    try {
      const next = action.type === "save" ? saveFunMoney(finance, action.amount)
        : action.type === "record" ? recordTreat(finance, action)
        : action.type === "undo" ? undoTreat(finance, action.id)
        : action.type === "look" ? saveLook(finance, action.look) : finance;
      setFinance(next);
      return true;
    } catch (error) {
      Alert.alert("A little mirror check", error.message);
      return false;
    }
  }

  function updateExtraPaycheck(action) {
    try {
      let next = finance;
      if (action.type === "bonus") next = addBonus(finance, action.entry);
      if (action.type === "split") next = saveSplit(finance, action.event, action.values);
      if (action.type === "celebrationSeen") next = { ...finance, extraPaycheckCelebrations: { ...(finance.extraPaycheckCelebrations || {}), [action.key]: true } };
      if (action.type === "removeBonus") {
        const plans = { ...(finance.extraPaycheckPlans || {}) };
        delete plans[action.id];
        next = { ...finance, extraPaychecks: (finance.extraPaychecks || []).filter(item => item.id !== action.id), extraPaycheckPlans: plans };
      }
      setFinance(next);
      return true;
    } catch (error) {
      Alert.alert("A little paycheck check", error.message);
      return false;
    }
  }

  function toggleManualMode() {
    Alert.alert(
      "Manual Mode",
      "You are driving for now. PayPlace can help you plan, but it will not move money or pay bills in this prototype."
    );
  }

  function showPlaidPlan() {
    setBankConnectionsVisible(true);
  }

  function addBill(newBill) {
  if (!newBill.name || !newBill.name.trim()) {
    Alert.alert("Missing bill name", "Give the bill a name first.");
    return false;
  }

  const amount = cleanNumber(newBill.amount);

  if (amount <= 0) {
    Alert.alert("Missing amount", "Add a bill amount greater than zero.");
    return false;
  }

  const savedBill = {
    id: newBill.id || `bill_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    name: newBill.name,
    amount: amount.toFixed(2),

    due: newBill.due || newBill.dueDate || "Jun 15",
    dueDate: newBill.dueDate || newBill.due || "Jun 15",

    status: newBill.status || "Upcoming",
    paymentMethod: newBill.paymentMethod || "Manual",
    paymentAddress: newBill.paymentAddress || "",
    accountNumberLast4: newBill.accountNumberLast4 || "",
    notes: newBill.notes || "",
    breakdown: reviewedBreakdown(newBill.breakdown || {}),
    source: newBill.source || "Manual entry",
    confidence: newBill.confidence || "Confirmed",
  };

  setFinance((current) => ({
    ...current,
    bills: [...(current.bills || []), savedBill],
  }));
  return true;
}


  function updateBill(updatedBill) {
    if (!updatedBill || !updatedBill.id) {
      Alert.alert("Bill not found", "This bill could not be updated.");
      return false;
    }

    const amount = cleanNumber(updatedBill.amount);

    if (!updatedBill.name || !updatedBill.name.trim()) {
      Alert.alert("Missing bill name", "Give the bill a name first.");
      return false;
    }

    if (amount <= 0) {
      Alert.alert("Missing amount", "Add a bill amount greater than zero.");
      return false;
    }

    setFinance((current) => ({
      ...current,
      bills: current.bills.map((bill) =>
        bill.id === updatedBill.id
          ? {
              ...bill,
              ...updatedBill,
              name: updatedBill.name.trim(),
              amount: amount.toFixed(2),
              due: updatedBill.due || updatedBill.dueDate || bill.due || "Jun 15",
              dueDate: updatedBill.dueDate || updatedBill.due || bill.dueDate || "Jun 15",
              status: updatedBill.status || bill.status || "Upcoming",
              paymentMethod: updatedBill.paymentMethod || "Manual",
              paymentAddress: updatedBill.paymentAddress || "",
              accountNumberLast4: updatedBill.accountNumberLast4 || "",
              notes: updatedBill.notes || "",
              source: updatedBill.source || bill.source || "Manual entry",
              confidence: updatedBill.confidence || bill.confidence || "Confirmed",
            }
          : bill
      ),
    }));
    return true;
  }

  function toggleBillPaid(id) {
    setFinance((current) => ({
      ...current,
      bills: current.bills.map((bill) =>
        bill.id === id
          ? { ...bill, status: bill.status === "Paid" || bill.paid === true ? "Upcoming" : "Paid", paid: !(bill.status === "Paid" || bill.paid === true) }
          : bill
      ),
    }));
  }

  const reviewBill = (billOrId) => {
  const bill =
    typeof billOrId === "object"
      ? billOrId
      : finance.bills.find((item) => item.id === billOrId);

  if (!bill) {
    Alert.alert("Bill not found", "This bill could not be reviewed.");
    return;
  }

  const paymentAddress =
    bill.paymentAddress && bill.paymentAddress.trim()
      ? bill.paymentAddress
      : "Not added yet";

  const accountNumber =
    bill.accountNumberLast4 && bill.accountNumberLast4.trim()
      ? `Account ending in ${bill.accountNumberLast4}`
      : "Not added yet";

  Alert.alert(
    `Review: ${bill.name}`,
    `Amount: $${bill.amount}
Due date: ${bill.dueDate}
Payment method: ${bill.paymentMethod || "Manual"}

Account:
${accountNumber}

Payment address:
${paymentAddress}

Notes:
${bill.notes || "No notes yet"}

Source: ${bill.source || "Manual entry"}
Confidence: ${bill.confidence || "Confirmed"}`,
    [{ text: "Got it" }]
  );
};

  function deleteBill(id) {
    setFinance(current => deleteEntry(current, "bills", id));
  }

  function addDebt(newDebt) {
    if (!newDebt.name.trim()) {
      Alert.alert("Missing debt name", "Give the debt a name first.");
      return;
    }

    const balance = cleanNumber(newDebt.balance);

    if (balance <= 0) {
      Alert.alert("Missing balance", "Add a debt balance greater than zero.");
      return;
    }

    setFinance((current) => initializeMixedTarget({
      ...current,
      debts: [
        ...current.debts,
        {
          id: `debt-${Date.now()}`,
          name: newDebt.name.trim(),
          balance,
          apr: cleanNumber(newDebt.apr),
          minimum: cleanNumber(newDebt.minimum),
        },
      ],
    }));
  }

  function payDebt(id, amount) {
    const at = Date.now();
    setFinance(current => {
      const debt = current.debts.find(item => item.id === id);
      const payment = Math.min(Number(debt?.balance || 0), Number(amount));
      if (!Number.isFinite(payment) || payment <= 0) return current;
      return {
        ...current,
        debts: current.debts.map(item => item.id === id ? { ...item, balance: Number(item.balance) - payment } : item),
        debtPaymentHistory: [...(current.debtPaymentHistory || []), { name: debt.name, amount: payment, at }],
      };
    });
  }

  function deleteDebt(id) {
    setFinance(current => deleteEntry(current, "debts", id));
  }

  function setPayoffMode(mode) {
    setFinance(current => selectStrategy(current, mode));
  }

  function handleOverwhelmed() {
    setCalmIndex((current) => (current + 1) % pearlCollections[pearlCategory].pearls.length);

    setFinance((current) => ({
      ...current,
      overwhelmedCount: current.overwhelmedCount + 1,
    }));

    setTab("Calm");
  }

  async function resetDemoData() {
    if (sampleFinance) {setSampleFinance({...samplePlan(starterFinance),quietMode:savedFinance.quietMode});return;}
    try {
      await ProtectedStorage.removeItem(STORAGE_KEY);
      setFinanceRaw(starterFinance);
      Alert.alert("Reset complete", "PayPlace is back to starter demo data.");
    } catch (error) {
      Alert.alert("Reset failed", "PayPlace could not clear saved data.");
    }
  }

  async function replayAnnieOnboarding() {
    if (sampleFinance) {setEssentialsPanel("firstWin");return;}
    setOnboardingSession(current => current + 1);
    setRevisitingAnnie(true);
  }

  function leaveAnnieVisit() {
    setRevisitingAnnie(false);
    setTab("Home");
  }

  async function finishOnboarding(answers) {
    if (dataDeletion.current) return;
    if (!hasVerifiedContact(answers)) {
      Alert.alert("Confirm your place", "Enter the security code sent to your email before continuing.");
      return;
    }
    const completedAnswers = completedProfile(answers);
    onboardingFinalizing.current = true;
    try {
      const chosenStrategy = !onboardingComplete && !revisitingAnnie && STRATEGY_ORDER.includes(answers.onboardingPayoffMethod);
      if (chosenStrategy) {
        const nextFinance = initializeMixedTarget(selectStrategy(savedFinance, answers.onboardingPayoffMethod));
        await ProtectedStorage.setItems({
          [STORAGE_KEY]: JSON.stringify(nextFinance),
          [ONBOARDING_KEY]: JSON.stringify(completedAnswers),
        });
        setSavedFinance(nextFinance);
      } else {
        await ProtectedStorage.setItem(ONBOARDING_KEY, JSON.stringify(completedAnswers));
      }
      setOnboardingAnswers(completedAnswers);
      setSelectedPlan(null);
      setOnboardingComplete(true);
      setRevisitingAnnie(false);
      if (!finance.firstWinComplete && !finance.bills.length) setEssentialsPanel("firstWin");
    } catch (error) {
      onboardingFinalizing.current = false;
      Alert.alert("Almost there", "PayPlace could not save onboarding yet. Please try again.");
      throw error;
    }
  }

  async function restorePlan(data) {
    if (sampleFinance) {Alert.alert("Return to your plan first", "Leave the sample neighborhood before restoring a personal backup.");return;}
    const restoredFinance = { ...starterFinance, ...data.finance, billReminders: { ...data.finance.billReminders, enabled: false }, subscriptionReminders: { enabled: false } };
    const recoveredProfile = restoredProfile(data.profile, ONBOARDING_STEPS.length);
    await ProtectedStorage.replaceAll({
      [STORAGE_KEY]: JSON.stringify(restoredFinance),
      [ONBOARDING_KEY]: JSON.stringify(recoveredProfile),
    });
    setFinanceRaw(restoredFinance);
    onboardingFinalizing.current = false;
    setOnboardingSession(current => current + 1);
    setOnboardingAnswers(recoveredProfile);
    setOnboardingComplete(false);
    setStorageError(false);
    setLoaded(true); setOnboardingLoaded(true);
    setTab("Home");
  }

  async function deleteDeviceData() {
    if (sampleFinance) throw new Error('Return to your personal plan before deleting personal data.');
    dataDeletion.current = true; onboardingFinalizing.current = true; setClearingData(true);
    try {
      await clearDeviceRecords(ProtectedStorage);
      setSavedFinance(emptyPlan(starterFinance)); setSampleFinance(null);
      setExtraCalendarVisible(false); setOnboardingAnswers({}); setOnboardingComplete(false); setRevisitingAnnie(false);
      setBankConnectionsVisible(false); setSecurityVisible(false); setEssentialsPanel(null);
      setTab('Home'); setStorageError(false); setLoaded(true); setOnboardingLoaded(true);
      setOnboardingSession(current => current + 1); setDeletionGeneration(current => current + 1);
      onboardingFinalizing.current = false;
    } catch (error) { dataDeletion.current = false; onboardingFinalizing.current = false; throw error; }
    finally { setClearingData(false); }
  }

  const securityPanel = <SecuritySettings visible={securityVisible} onClose={() => setSecurityVisible(false)} finance={finance} profile={onboardingAnswers} onRestore={restorePlan} recovery={storageError} onRemindersChange={changeReminders} reminderStatus={reminderStatus} onUndoDeletion={undoDeletion} onDeleteDevice={deleteDeviceData} demo={!!sampleFinance} />;

  if (storageError) {
    return <SafeAreaView style={[styles.safe, styles.onboardingLoading]}>
      <Ionicons name="lock-closed" size={40} color={palette.teal} />
      <Text style={styles.onboardingLoadingText}>Your saved plan could not be opened.</Text>
      <Text style={{ margin: 24, color: palette.ink, textAlign: "center" }}>Your saved entries have not been replaced. Try again, or recover your plan from an encrypted backup.</Text>
      <TouchableOpacity onPress={() => setLoadAttempt(n => n + 1)} style={styles.visitAnnieButton}><Text style={styles.visitAnnieText}>Try again</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => setSecurityVisible(true)} style={styles.visitAnnieButton}><Text style={styles.visitAnnieText}>Restore a backup</Text></TouchableOpacity>
      {securityPanel}
    </SafeAreaView>;
  }

  if (!loaded || !onboardingLoaded) {
    return (
      <SafeAreaView style={[styles.safe, styles.onboardingLoading]}>
        <Ionicons name="leaf" size={40} color={palette.teal} />
        <Text style={styles.onboardingLoadingText}>Opening the neighborhood…</Text>
      </SafeAreaView>
    );
  }

  if ((!onboardingComplete && !sampleFinance) || revisitingAnnie) {
    return (
      <>
        <OnboardingFlow onSample={startSample} onBankDemo={startBankDemo} onOpenPrivacy={() => setSecurityVisible(true)} key={onboardingSession} initialAnswers={onboardingAnswers} onProgress={saveOnboardingProgress} onComplete={finishOnboarding} onExit={revisitingAnnie ? leaveAnnieVisit : undefined} />
        {securityPanel}
        <BankConnections visible={bankConnectionsVisible} onClose={() => setBankConnectionsVisible(false)} onUseBalance={(balance) => setFinance((current) => ({ ...current, balance, balanceUpdatedAt:Date.now(),balanceSource:"Bank connection" }))} />
      </>
    );
  }

  return (
    <EncouragementProvider communityEnabled={!sampleFinance} onMilestone={addQuiltSquare}>
    <PrivacyContext.Provider value={quiet}>
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />
        <View style={styles.glowThree} />

        {sampleFinance && !onTownMap && <View style={{padding:12,backgroundColor:"#FFF1CC"}}><Text style={{fontWeight:"900",color:palette.ink}}>SAMPLE NEIGHBORHOOD · Fictional money</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Return to my personal plan" onPress={endSample} style={{padding:12}}><Text>Return to my personal plan</Text></TouchableOpacity></View>}
        {!onTownMap && <Header tab={tab}
          onHelp={tab === "Plans" ? undefined : () => setTabHelpVisible(true)}
          onPlans={tab === "Plans" ? undefined : () => setTab("Plans")}
          onSecurity={() => setSecurityVisible(true)} />}
        {tab === "Plans" && <PayPlacePlans selectedId={selectedPlan || payPlacePlans.find(plan => plan.id === onboardingAnswers.planPreference)?.id || "basic"} onSelectPlan={setSelectedPlan} onOpenTool={openPlanTool} onOpenDemo={startBankDemo} />}
        <ScreenHelp tab={tab} visible={tabHelpVisible} onClose={() => setTabHelpVisible(false)} />
        {["BankingDemo", "Billiam", "Debt"].includes(tab) && (
          <MoneyToolBack destination={tab === "Debt" ? debtEntry.back : tab === "Billiam" ? billiamBack : "Bills"} onBack={setTab} />
        )}

        {tab === "Finances" && (
          <MyFinancesScreen
            finance={finance}
            onEssentials={setEssentialsPanel}
            upcomingTotal={upcomingTotal}
            debtDueTotal={debtDueTotal}
            safeToSpend={safeToSpend}
            safeToSpendDaily={safeToSpendDaily}
            switchTab={setTab}
            onDetective={openSubscriptionDetective}
            onPayoffMethods={() => openDebt(true, "Finances")}
            onStepsChange={next => setFinanceRaw(current => ({...current,smallSteps:next}))}
            onSavings={() => setSavingsVisible(true)}
          />
        )}

        {tab === "Bills" && (
          <BillsScreen
            bills={finance.bills}
            onBankingDemo={openBankingDemo}
            onBankLinking={sampleFinance ? undefined : showPlaidPlan}
            onDebt={() => openDebt(false)}
            onMonthlyCalendar={() => setMonthlyCalendarMode("print")}
            onMicropayments={() => setMicropaymentsVisible(true)}
            addBill={addBill}
            updateBill={updateBill}
            toggleBillPaid={toggleBillPaid}
            reviewBill={reviewBill}
            deleteBill={deleteBill}
            onBilliam={() => openBilliam("Bills")}
            onHistory={() => setEssentialsPanel("history")}
            onSubscriptions={openSubscriptionDetective}
          />
        )}

        {tab === "Billiam" && <BilliamHome finance={finance} onAdd={addBill} onUpdate={updateBill}
          onTemplates={next => setFinance(current => ({...current,billiamRecurring:next}))}
          onHousehold={next => setFinance(current => ({...current,householdPlan:next}))} />}

        {tab === "Budget" && (
          <BudgetScreen
            finance={finance}
            upcomingTotal={upcomingTotal}
            safeToSpend={safeToSpend}
            updateNumber={updateNumber}
            updateText={updateText}
            resetDemoData={resetDemoData}
            onPayday={() => setEssentialsPanel("payday")}
            onCalendar={() => setExtraCalendarVisible(true)}
            onSavings={() => setSavingsVisible(true)}
            onCategories={() => setCategoriesVisible(true)}
            onOutlook={() => setOutlookVisible(true)}
          />
        )}

        {tab === "Debt" && (
          <DebtScreen
            debts={finance.debts}
            showPayoffStrategy={debtEntry.showMethods}
            onMicropayments={() => setMicropaymentsVisible(true)}
            payoffMode={finance.payoffMode}
            mixedQuickWinId={finance.mixedQuickWinId}
            setPayoffMode={setPayoffMode}
            addDebt={addDebt}
            payDebt={payDebt}
            deleteDebt={deleteDebt}
          />
        )}

        {tab === "BankingDemo" && <PremiumResilienceHub
          key={bankingDemoVisit}
          embedded
          finance={finance}
          premiumState={normalizePremiumState(finance.premiumResilience)}
          onPremiumStateChange={next => setFinance(current => ({ ...current, premiumResilience: normalizePremiumState(next) }))}
          betaState={normalizePremiumBeta(finance.premiumBeta)}
          onBetaStateChange={next => setFinance(current => ({ ...current, premiumBeta: normalizePremiumBeta(next) }))}
          onOpenCategories={() => setCategoriesVisible(true)}
          onBankAction={sampleFinance ? updateDemoBank : undefined}
          onOpenSubscriptions={openSubscriptionDetective}
          onOpenBills={() => setTab("Bills")}
          onStartDemo={startBankDemo}
          onCreditChange={text => updateNumber("creditScore", text)}
        />}

        {onTownMap && <NeighborhoodMapScreen
          canRotate={Platform.OS !== "web" && !rotationUnavailable} reduceAnimation={quiet.reduceAnimation}
          paused={obscured || securityVisible || tabHelpVisible || !!essentialsPanel || cabaretVisible}
          onOpen={next => {
            if (next === "Billiam") openBilliam(tab);
            else if (next === "Cabaret") setCabaretVisible(true);
            else { if (next === "Calm") setCalmBack(tab); setTab(next); }
          }}
          safeToSpendDaily={safeToSpendDaily} daysUntilPayday={finance.daysUntilPayday}
          showWelcome={!welcomeSeen && !obscured && !essentialsPanel && !sampleFinance}
          onWelcomeSeen={seeWelcome}
          weatherZip={finance.neighborhoodWeatherZip}
          onWeatherZip={zip => setFinanceRaw(current => ({ ...current, neighborhoodWeatherZip: zip }))}
          onHelp={() => setTabHelpVisible(true)} onSecurity={() => setSecurityVisible(true)}
          onLeaveSample={sampleFinance ? endSample : null}>
          <ExpandableSection title="Annie’s porch & quiet tools">
            <FeatureLinks items={[
              {title:'I am overwhelmed',body:'Take a soft landing with Westley.',onPress:handleOverwhelmed},
              {title:'Quiet Mode',body:'Reminders, animation and hidden amounts.',onPress:()=>setEssentialsPanel('quiet')},
              {title:'Visit Annie again',body:'Revisit your welcome and answers.',onPress:replayAnnieOnboarding},
            ]} />
            <ExpandableSection title="A little care from Annie" artworkAction="annieCare" compact>
              <NeighborCare finance={finance} onChange={next => setFinanceRaw(current => ({...current,annieCare:next}))} status={annieStatus} onSmallStep={()=>setTab('Finances')} onCalm={()=>setTab('Calm')}/>
            </ExpandableSection>
            <ExpandableSection title="Annie’s porch & today’s poster" artworkAction="anniePoster" compact>
              <NeighborhoodWelcome finance={finance} onQuiltMilestone={addQuiltSquare} reduceAnimation={quiet.reduceAnimation} switchTab={setTab} safeToSpendDaily={safeToSpendDaily} onDetective={openSubscriptionDetective}/>
            </ExpandableSection>
          </ExpandableSection>
        </NeighborhoodMapScreen>}
        {tab === "Spa" && <MoneyToolBack destination="Neighborhood" onBack={setTab} />}
        {tab === "Calm" && <MoneyToolBack destination={calmBack} onBack={setTab} />}
        {tab === "Calm" && (
          <CalmScreen
            pearl={pearlCollections[pearlCategory].pearls[calmIndex % pearlCollections[pearlCategory].pearls.length]}
            count={finance.overwhelmedCount}
            category={pearlCategory}
            collections={pearlCollections}
            categoryOrder={pearlCategoryOrder}
            selectCategory={(key) => { setPearlCategory(key); setCalmIndex(0); }}
            nextPearl={() => setCalmIndex((current) => (current + 1) % pearlCollections[pearlCategory].pearls.length)}
          />
        )}

        {tab === "Spa" && <PetSpa onGrooming={() => setMonthlyCalendarMode("grooming")} reduceAnimation={finance.quietMode?.reduceAnimation} obscured={tabHelpVisible || securityVisible || bankConnectionsVisible || savingsVisible || detectiveVisible || !!monthlyCalendarMode}
          library={finance.neighborhoodLibrary} onLibraryChange={changeLibrary} />}
        {["Annie", "Bobbie", "Westley", "Tate", "Chapo", "Daddy"].includes(tab) && <NeighborRoom key={tab} destination={tab}
          finance={finance} onHome={() => setTab("Neighborhood")}
          onNavigate={next => { if (next === "Calendar") setExtraCalendarVisible(true); else if (next === "Savings") setSavingsVisible(true); else if (next === "Subscriptions") openSubscriptionDetective(); else if (next === "BankingDemo") openBankingDemo(); else if (next === "Billiam") openBilliam("Neighborhood"); else setTab(next); }}
          onMirrorAction={updateMirror}
          onLibraryChange={changeLibrary} onQuiltMilestone={addQuiltSquare}
          onStepsChange={next => setFinanceRaw(current => ({...current, smallSteps: next}))} />}

        {!onTownMap && recentDeleted.length > 0 && <View accessibilityLiveRegion="polite" style={{ marginHorizontal: 18, padding: 12, borderRadius: 18, backgroundColor: palette.lavender, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={{ flex: 1, color: palette.ink }}>Deleted {recentDeleted[0].collection === "bills" ? "bill" : "debt"}. You can bring it back.</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Undo last deletion" onPress={() => undoDeletion(recentDeleted[0].key)} style={{ padding: 8 }}><Text style={{ color: palette.purple, fontWeight: "800" }}>Undo</Text></TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="View recently deleted entries" onPress={() => setSecurityVisible(true)} style={{ padding: 8 }}><Text style={{ color: palette.purple, fontWeight: "800" }}>All</Text></TouchableOpacity>
        </View>}
        {!onTownMap && <NeighborhoodNav current={tab === "Billiam" ? billiamBack : tab === "Calm" ? calmBack : tab} switchTab={next => next === "BankingDemo" ? openBankingDemo() : setTab(next)} />}
        {monthlyCalendarMode && <MonthlyPaymentCalendar sample={!!sampleFinance} finance={finance}
          canPrint={monthlyCalendarMode !== "view"} startGrooming={monthlyCalendarMode === "grooming"} onClose={() => setMonthlyCalendarMode(null)}
          onAppointmentsChange={groomingAppointments => setFinanceRaw(current => keepQuiltMilestones(current, { ...current, groomingAppointments }))} />}
        {outlookVisible && <MoneyOutlook finance={finance} sample={!!sampleFinance} onClose={() => setOutlookVisible(false)} />}
        <ExtraPaycheckCalendar visible={extraCalendarVisible} onClose={()=>setExtraCalendarVisible(false)} finance={finance} upcomingTotal={upcomingTotal} onAction={updateExtraPaycheck} onBudget={()=>{setExtraCalendarVisible(false);setTab('Budget');}} />
        <Micropayments key={`micro-${sampleFinance ? 'sample' : 'personal'}-${deletionGeneration}`} visible={micropaymentsVisible}
          onClose={() => setMicropaymentsVisible(false)} finance={finance} onRecord={saveMicropayment} onUndo={undoExtraPayment} />
        <LaunchEssentials panel={essentialsPanel} onClose={() => setEssentialsPanel(null)} finance={finance} onChange={setFinance}
          onUndo={undoRecordedPayment} onCorrect={correctRecordedPayment} onFirstWin={saveFirstWin} onSample={startSample} onPersonal={endSample}/>
        <SavingsGoals visible={savingsVisible} onClose={() => setSavingsVisible(false)} goals={finance.savingsGoals || []}
          onUpdate={goals => setFinance(current => ({ ...current, savingsGoals: goals }))} />
        {categoriesVisible && <MerchantCategories key={`${sampleFinance ? 'sample' : 'personal'}-${deletionGeneration}`} visible
          onClose={() => setCategoriesVisible(false)} value={finance.categorization} onChange={saveCategories} sample={!!sampleFinance} />}
        {cabaretVisible && <BobbieCabaret visible onClose={() => setCabaretVisible(false)}
          returnLabel={onTownMap ? "Back to the neighborhood" : tab === "Finances" ? "Back to My Finances" : undefined} />}
        <SubscriptionDetective visible={subscriptionPreview && detectiveVisible} onClose={() => setDetectiveVisible(false)}
          finance={finance} onAction={updateDetective} onBills={() => setTab("Bills")} />
        {securityPanel}
        <BankConnections visible={bankConnectionsVisible} onClose={() => setBankConnectionsVisible(false)} onUseBalance={(balance) => setFinance((current) => ({ ...current, balance, balanceUpdatedAt:Date.now(),balanceSource:"Bank connection" }))} />
      </KeyboardAvoidingView>
    </SafeAreaView>
    </PrivacyContext.Provider>
    </EncouragementProvider>
  );
}


const ONBOARDING_STEPS = [
  {
    key: "name",
    mascot: "Westley",
    role: "Chaos Coach",
    question: "What should we call you?",
    helper: "No forms in triplicate. Just the name that feels like yours.",
    placeholder: "Your name",
    image: portraits.westley,
    type: "text",
    keyboardType: "default",
    accent: palette.purple,
  },
  {
    key: "goal",
    mascot: "Bobbie",
    role: "Confidence Queen",
    question: "What are you working toward?",
    helper: "Pick the goal that would make Future You breathe easier.",
    image: portraits.bobbie,
    type: "choice",
    options: ["Pay off debt", "Build an emergency fund", "Stop living paycheck to paycheck", "Save for something exciting", "Feel calmer about money"],
    accent: palette.coral,
  },
  {
    key: "moneyFeeling",
    mascot: "Chapo",
    role: "Reward Goblin",
    question: "How does managing money feel right now?",
    helper: "There is no wrong answer and absolutely no shame trapdoor.",
    image: portraits.chapo,
    type: "choice",
    options: ["I feel confident", "It’s complicated", "I feel overwhelmed", "I avoid it when I can"],
    accent: palette.goldDark,
  },
  {
    key: "challenge",
    mascot: "Tate",
    role: "Tiny Win Champion",
    question: "What’s your biggest money challenge?",
    helper: "We’ll use this to choose the gentlest first step.",
    image: portraits.tate,
    type: "choice",
    options: ["Keeping up with bills", "Overspending", "Saving consistently", "Paying down debt", "Impulse purchases", "Knowing what is safe to spend"],
    accent: palette.teal,
  },
  {
    key: "payFrequency",
    mascot: "Westley",
    role: "Chaos Coach",
    question: "How often do you get paid?",
    helper: "This helps Safe to Spend understand the road between paydays.",
    artworkAction: "onboardingPayday",
    type: "choice",
    options: ["Weekly", "Every 2 weeks", "Twice a month", "Monthly", "It varies"],
    accent: palette.purple,
  },
  {
    key: "connectBank",
    mascot: "Bobbie",
    role: "Confidence Queen",
    question: "Would bank linking help you later?",
    helper: "Plaid bank linking and subscription tracking are paid Premium features. You can enter balances, bills and subscriptions manually with regular PayPlace.",
    image: require("./assets/characters/onboarding-bank-linking-bobbie.png"),
    type: "choice",
    options: ["I’m interested", "Maybe later", "I prefer manual mode"],
    accent: palette.coral,
  },
  {
    key: "notes",
    mascot: "The Post Office Treehouse",
    role: "Letters from Future You",
    question: "Anything else you want us to know?",
    helper: "A hope, a worry, a promise to yourself. This can shape future letters.",
    placeholder: "I want Future Me to remember…",
    image: require("./assets/characters/nav-post-office.png"),
    type: "multiline",
    keyboardType: "default",
    accent: palette.blue,
    optional: true,
  },
  {
    key: "onboardingPayoffMethod",
    mascot: "Daddy",
    role: "Budget Coach",
    question: "How would you like to pay down debt?",
    helper: "You can change your method and record extra payments anytime under Payoff methods.",
    image: portraits.daddy,
    type: "choice",
    optional: true,
    options: [
      { id: "snowball", title: "Snowball", detail: "Start with the smallest balance." },
      { id: "avalanche", title: "Avalanche", detail: "Start with the highest interest rate." },
      { id: "mixed", title: "Mixed", detail: "Pay off one small balance, then focus on the highest interest rate." },
      { id: "later", title: "Decide later" },
    ],
    accent: palette.purple,
  },
  {
    key: "planPreference",
    question: "Which PayPlace plan interests you?",
    helper: "Beta access is free. The monthly prices below are proposed. Your choice is saved for later.",
    type: "choice",
    optional: true,
    options: [
      ...payPlacePlans.map(plan => ({ id: plan.id, title: plan.name, detail: `${plan.price}/month · ${plan.onboardingSummary}` })),
      { id: "later", title: "Decide later" },
    ],
    accent: palette.purple,
  },
];

function OnboardingFlow({ initialAnswers, onProgress, onComplete, onExit, onSample, onBankDemo, onOpenPrivacy }) {
  const [bankDemoVisible, setBankDemoVisible] = useState(false);
  const [welcomeStage, setWelcomeStage] = useState(() => onExit ? "annie" : onboardingPosition(initialAnswers, ONBOARDING_STEPS.length).stage);
  const [stepIndex, setStepIndex] = useState(() => onboardingPosition(initialAnswers, ONBOARDING_STEPS.length).stepIndex);
  const [answers, setAnswers] = useState(initialAnswers);
  useEffect(() => {
    // Revisit drafts stay local; leaving or restarting keeps the completed profile.
    if (!onExit) onProgress(onboardingDraft(answers, welcomeStage, stepIndex));
  }, [answers, welcomeStage, stepIndex, onProgress, onExit]);
  const exitButton = onExit ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to Home" style={styles.onboardingBackButton} onPress={onExit}>
    <Ionicons name="arrow-back" size={20} color={palette.ink} /><Text style={styles.onboardingBackText}>Back to Home</Text>
  </TouchableOpacity> : null;
  const step = ONBOARDING_STEPS[stepIndex];
  const value = answers[step.key] || "";
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1;
  const canContinue = step.optional || String(value).trim().length > 0;

  function choose(option) {
    setAnswers((current) => ({ ...current, [step.key]: option }));
  }

  function next() {
    if (!canContinue) {
      Alert.alert("One tiny detail", "Choose or enter an answer before continuing.");
      return;
    }
    if (isLast) {
      setWelcomeStage("quilt");
      return;
    }
    setStepIndex((current) => current + 1);
  }

  if (bankDemoVisible) return <SafeAreaView style={styles.onboardingSafe}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={{padding:20}} keyboardShouldPersistTaps="handled">
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to Annie from banking demo" style={styles.onboardingBackButton} onPress={() => setBankDemoVisible(false)}><Text style={styles.onboardingBackText}>Back to Annie</Text></TouchableOpacity>
    <BobbieBankDemoLogin onConnect={onBankDemo}/>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;

  if (welcomeStage === "annie") {
    return (
      <SafeAreaView style={styles.onboardingSafe}>
        <ScrollView contentContainerStyle={styles.annieWelcomeScroll}>
          {onBankDemo && <BankWelcomeCard demoLabel="Try Bobbie’s banking demo before setup" onDemo={() => setBankDemoVisible(true)} />}
          <CharacterArtwork source={imageSource(greatAnnieHero)} style={styles.annieWelcomeImage} resizeMode="contain" />

          <View style={styles.annieWelcomeCard}>
            {exitButton}
            <Text style={styles.annieWelcomeEyebrow}>GREAT ANNIE OAK TREE</Text>
            <Text style={styles.annieWelcomeTitle}>There you are.</Text>
            <Text style={styles.annieWelcomeBody}>“Every new neighbor eventually finds their way here. Sit with me for a minute, sweetheart.”</Text>
            {onSample && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Explore sample neighborhood before setup" style={styles.onboardingBackButton} onPress={onSample}><Text style={styles.onboardingBackText}>Explore the sample neighborhood first</Text></TouchableOpacity>}

            <PrivacyLinks />
            {onOpenPrivacy && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open privacy and data deletion" style={styles.onboardingBackButton} onPress={onOpenPrivacy}><Text style={styles.onboardingBackText}>Privacy & data controls</Text></TouchableOpacity>}
            <Text style={styles.annieWelcomePrompt}>What brought you to PayPlace?</Text>
            <View style={styles.annieWelcomeChoices}>
              {["I want less financial stress", "I’m starting over", "I want to pay off debt", "I’m saving for something important", "I’m trying to get organized", "I’m not sure yet"].map((option) => {
                const selected = answers.arrivalReason === option;
                return (
                  <TouchableOpacity key={option} onPress={() => setAnswers((current) => ({ ...current, arrivalReason: option }))} style={[styles.annieWelcomeChoice, selected && styles.annieWelcomeChoiceSelected]}>
                    <Ionicons name={selected ? "heart" : "heart-outline"} size={20} color={selected ? palette.coral : palette.teal} />
                    <Text style={styles.annieWelcomeChoiceText}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity disabled={!answers.arrivalReason} style={[styles.annieWelcomeButton, !answers.arrivalReason && styles.annieWelcomeButtonDisabled]} onPress={() => setWelcomeStage("questions")}>
              <Text style={styles.annieWelcomeButtonText}>Sit with Annie</Text>
              <Ionicons name="leaf" size={20} color="white" />
            </TouchableOpacity>

          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (welcomeStage === "email") {
    return <SafeAreaView style={styles.onboardingSafe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
          <EmailVerification answers={answers} onDraftChange={draft => setAnswers(current => ({ ...current, ...draft }))} onVerified={onComplete} />
          {exitButton}
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to your quilt" style={styles.onboardingBackButton} onPress={() => setWelcomeStage("quilt")}>
            <Ionicons name="arrow-back" size={20} color={palette.ink} /><Text style={styles.onboardingBackText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>;
  }

  if (welcomeStage === "quilt") {
    return (
      <SafeAreaView style={styles.onboardingSafe}>
        <ScrollView contentContainerStyle={styles.quiltGiftScroll}>
          <View style={styles.quiltGiftGlow} />
          <View style={styles.quiltGiftCard}>
            {exitButton}
            <Text style={styles.quiltGiftEyebrow}>THE BELONGING QUILT</Text>
            <AcornSquare />
            <Text style={styles.quiltGiftTitle}>An acorn, just for beginning.</Text>
            <Text style={styles.quiltGiftDialogue}>“Around here, everyone gets their first quilt square the day they arrive.”</Text>
            <Text style={styles.quiltGiftQuestion}>“But I haven’t earned this.”</Text>
            <Text style={styles.quiltGiftAnswer}>“No, sweetheart. Belonging isn’t something you earn. It’s something you’re given.”</Text>
            <View style={styles.quiltNote}>
              <Text style={styles.quiltNoteText}>Welcome home.</Text>
              <Text style={styles.quiltNoteSignature}>Love, Annie 🌳</Text>
            </View>
            <Text style={styles.quiltGiftFooter}>Annie quietly stitches the matching half into the neighborhood quilt. Your place is here now.</Text>
            <TouchableOpacity accessibilityRole="button" style={styles.quiltGiftButton} onPress={() => { if (hasVerifiedContact(answers)) onComplete(answers).catch(() => {}); else setWelcomeStage("email"); }}>
              <Text style={styles.quiltGiftButtonText}>Enter the neighborhood</Text>
              <Ionicons name="home" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to your answers" style={styles.onboardingBackButton} onPress={() => { setStepIndex(ONBOARDING_STEPS.length - 1); setWelcomeStage("questions"); }}>
              <Ionicons name="arrow-back" size={20} color={palette.ink} /><Text style={styles.onboardingBackText}>Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.onboardingSafe}>
      <KeyboardAvoidingView style={styles.onboardingSafe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
         <ScrollView contentContainerStyle={styles.onboardingScroll} keyboardShouldPersistTaps="handled">
  <PayPlaceBrand style={styles.onboardingBrandRow} />
          {exitButton}

          <View style={styles.onboardingProgressTrack}>
            <View style={[styles.onboardingProgressFill, { width: `${((stepIndex + 1) / ONBOARDING_STEPS.length) * 100}%`, backgroundColor: step.accent }]} />
          </View>
          <Text style={styles.onboardingStepLabel}>Question {stepIndex + 1} of {ONBOARDING_STEPS.length}</Text>

          <View style={styles.onboardingCard}>
            {step.artworkAction ? (
              <View style={[styles.onboardingImage, {alignItems:"center"}]}>
                <ActionArtwork action={step.artworkAction} size={210} />
              </View>
            ) : step.image && <CharacterArtwork source={imageSource(step.image)} style={styles.onboardingImage} resizeMode="contain" />}
            {step.mascot && <View style={[styles.onboardingMascotBadge, { backgroundColor: step.accent }]}>
              <Text style={styles.onboardingMascotName}>{step.mascot}</Text>
              <Text style={styles.onboardingMascotRole}>{step.role}</Text>
            </View>}
            <Text style={styles.onboardingQuestion}>{step.question}</Text>
            <Text style={styles.onboardingHelper}>{step.helper}</Text>

            {step.type === "choice" ? (
              <View style={styles.onboardingChoices}>
                {step.options.map((option) => {
                  const { id, title, detail } = typeof option === "string" ? { id: option, title: option } : option;
                  const selected = value === id;
                  return (
                    <TouchableOpacity
                      key={id}
                      onPress={() => choose(id)}
                      accessibilityRole="button"
                      accessibilityLabel={detail ? `${title}. ${detail}` : title}
                      accessibilityState={{ selected }}
                      style={[styles.onboardingChoice, selected && { borderColor: step.accent, backgroundColor: `${step.accent}16` }]}
                    >
                      <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={22} color={selected ? step.accent : palette.muted} />
                      <View style={styles.flexOne}>
                        <Text style={[styles.onboardingChoiceText, selected && { color: palette.ink }]}>{title}</Text>
                        {detail && <Text style={styles.onboardingHelper}>{detail}</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <TextInput
                accessibilityLabel={step.question}
                value={value}
                onChangeText={(text) => setAnswers((current) => ({ ...current, [step.key]: text }))}
                placeholder={step.placeholder}
                placeholderTextColor="#94A3B8"
                keyboardType={step.keyboardType}
                autoCapitalize={step.key === "email" ? "none" : "sentences"}
                autoCorrect={step.key !== "email"}
                multiline={step.type === "multiline"}
                style={[styles.onboardingInput, step.type === "multiline" && styles.onboardingInputMultiline, { borderColor: value ? step.accent : palette.border }]}
              />
            )}
          </View>

          <View style={styles.onboardingButtons}>
              <TouchableOpacity accessibilityRole="button" style={styles.onboardingBackButton} onPress={() => stepIndex > 0 ? setStepIndex((current) => current - 1) : setWelcomeStage("annie")}>
                <Ionicons name="arrow-back" size={20} color={palette.ink} />
                <Text style={styles.onboardingBackText}>Back</Text>
              </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" disabled={!canContinue} style={[styles.onboardingNextButton, { backgroundColor: canContinue ? step.accent : "#CBD5E1" }]} onPress={next}>
              <Text style={styles.onboardingNextText}>{isLast ? "Meet Annie" : "Next"}</Text>
              <Ionicons name={isLast ? "leaf" : "arrow-forward"} size={20} color="white" />
            </TouchableOpacity>
          </View>

          {isLast && (
            <View style={styles.firstLetterPreview}>
              <Ionicons name="mail" size={24} color={palette.coral} />
              <Text style={styles.firstLetterTitle}>Your first letter is waiting</Text>
              <Text style={styles.firstLetterText}>The Post Office Treehouse will welcome you with a note from Future You.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header({ onSecurity, onHelp, onPlans, tab }) {
  const helpArt = tab === "Finances" ? "homeGuide" : tab === "Debt" ? "debtHelp" : null;
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <PayPlaceBrand compact style={styles.headerBrand} />

        <View style={[styles.statusPill, { backgroundColor: palette.aqua }]}>
          <Ionicons name="construct" size={14} color={palette.teal} />
          <Text style={[styles.statusText, { color: palette.teal }]}>Manual Mode</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
        {onHelp && <TouchableOpacity artworkMode="integrated" accessibilityRole="button"
          accessibilityLabel={`How ${neighborhoodLabel(tab)} works`} onPress={onHelp} style={styles.headerHelp}>
          {helpArt ? <ActionArtwork action={helpArt} size={30} />
            : <Ionicons name="help-circle-outline" size={20} color={palette.purple} />}
          <Text style={styles.headerHelpText}>Help</Text>
        </TouchableOpacity>}
        {onPlans && <TouchableOpacity testID="open-plans" accessibilityRole="button" accessibilityLabel="Open PayPlace plans" onPress={onPlans}
          style={styles.headerPlans}>
          <Text style={{color:palette.ink,fontWeight:"900"}}>Plans</Text>
        </TouchableOpacity>}
        {onSecurity && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open security and backup settings" hitSlop={8} onPress={onSecurity}
          style={{width:48,minHeight:48,alignItems:"center",justifyContent:"center",marginLeft:8}}>
          <Ionicons name="shield-checkmark-outline" size={22} color={palette.purple} />
        </TouchableOpacity>}
      </View>
    </View>
  );
}


function NeighborhoodWelcome({ finance, onQuiltMilestone, switchTab, safeToSpendDaily, onDetective, reduceAnimation }) {
  const neighborhoodArtwork = useNeighborhoodArtwork();
  const [foyerOpen, setFoyerOpen] = useState(false);
  const [foyerStage, setFoyerStage] = useState("door");
  const [familyMember, setFamilyMember] = useState(null);
  const day = getNeighborhoodDay();
  const poster = NEIGHBORHOOD_POSTERS[day % NEIGHBORHOOD_POSTERS.length];
  const posterSource = imageSource(poster.image);
  const posterDimensions = posterSource?.crop
    ? { width: posterSource.crop[2], height: posterSource.crop[3] }
    : Image.resolveAssetSource(posterSource);
  const posterAspectRatio = posterDimensions.width / posterDimensions.height;
  const greeting = NEIGHBORHOOD_GREETING[day % NEIGHBORHOOD_GREETING.length];

  const openFoyer = () => {
    setFoyerStage("door");
    setFoyerOpen(true);
  };

  const closeFoyer = () => {
    setFoyerOpen(false);
    setFoyerStage("door");
  };

  return (
    <>
      <Modal visible={foyerOpen} animationType="fade" transparent={false} onRequestClose={() => ["story", "quilt"].includes(foyerStage) ? setFoyerStage("home") : closeFoyer()}>
        <SafeAreaView style={styles.foyerSafe}>
          {foyerStage === "quilt" && <QuiltDetail finance={finance} onMilestone={onQuiltMilestone} onBack={() => setFoyerStage("home")} />}
          {foyerStage === "story" && familyMember && (
            <CharacterStory person={familyMember} onBack={() => setFoyerStage("home")} />
          )}
          {foyerStage === "door" && (
            <View style={styles.redDoorScene}>
              <TouchableOpacity artworkMode="hotspot" accessibilityRole="button" accessibilityLabel="Enter through Annie's red PayPlace door" style={StyleSheet.absoluteFillObject} activeOpacity={0.95} onPress={() => setFoyerStage("home")}>
                <CharacterArtwork source={greatAnnieHero} style={styles.foyerArrivalImage} resizeMode="contain" />
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close Annie's welcome" style={[styles.foyerCloseButton, { minWidth: 48, minHeight: 48 }]} onPress={closeFoyer}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.doorSceneCopy} pointerEvents="none">
                <Text style={styles.redDoorTitle}>Annie's red door</Text>
                <Text style={styles.redDoorText}>Go ahead. The family left the porch light on.</Text>
                <Text style={styles.redDoorHint}>Tap the door to enter</Text>
              </View>
            </View>
          )}

          {foyerStage === "home" && (
            <ScrollView style={styles.foyerHome} contentContainerStyle={styles.foyerHomeContent}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close Annie’s foyer" style={[styles.foyerHomeClose, { minWidth: 48, minHeight: 48 }]} onPress={closeFoyer}>
                <Ionicons name="close" size={23} color={palette.ink} />
              </TouchableOpacity>
              <View style={styles.foyerArch}>
                <CharacterArtwork source={greatAnnieHero} style={styles.foyerArchImage} resizeMode="contain" />
                <View style={styles.foyerArchShade} />
                <Text style={styles.foyerWelcome}>Welcome Home</Text>
              </View>

              <FamilyWall onSelect={(person) => {
                setFamilyMember(person);
                setFoyerStage("story");
              }} />

              <BelongingQuilt onOpen={() => setFoyerStage("quilt")} />

              <View style={styles.foyerMessageCard}>
                <Ionicons name="heart" size={25} color="#FF6E83" />
                <View style={styles.flexOne}>
                  <Text style={styles.foyerMessageTitle}>Home is where you're loved exactly as you are.</Text>
                  <Text style={styles.foyerMessageText}>No lectures. No shame spiral. Just your family, your neighborhood, and the next gentle step.</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.foyerEnterButton} onPress={closeFoyer}>
                <Text style={styles.foyerEnterButtonText}>Enter the neighborhood</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      <View style={styles.neighborhoodHero}>
        <FittedArtwork source={neighborhoodArtwork.source} style={styles.heroArtwork} testID="neighborhood-map-artwork"
          accessibilityLabel="Annie's neighborhood map. Choose a treehouse to visit." />
        <View style={styles.heroEdgeShade} pointerEvents="none" />

        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open Annie's red stained-glass door"
          style={[styles.heroHotspot, styles.annieDoorHotspot]} activeOpacity={0.6} onPress={openFoyer} />

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open the Post Office bills screen"
          style={[styles.heroHotspot, styles.postOfficeHotspot]}
          onPress={() => switchTab("Bills")}
        />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open Bobbie's Budget Studio"
          style={[styles.heroHotspot, styles.budgetHotspot]}
          onPress={() => switchTab("Budget")}
        />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open the Debt Tree Climb"
          style={[styles.heroHotspot, styles.debtHotspot]}
          onPress={() => switchTab("Debt")}
        />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open the Calm Garden"
          style={[styles.heroHotspot, styles.calmHotspot]}
          onPress={() => switchTab("Calm")}
        />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open the Subscription Detective Clubhouse, Premium feature"
          style={[styles.heroHotspot, { left: "78%", top: "33%", width: "17%", height: "23%", minWidth: 48, minHeight: 48 }]}
          onPress={onDetective} />
      </View>


      <TouchableOpacity artworkMode="integrated" accessibilityRole="button" accessibilityLabel="Visit Em’s Pet Spa" onPress={() => switchTab("Spa")}
        style={{ marginHorizontal: 18, marginTop: 12, overflow: "hidden", borderRadius: 20, backgroundColor: "#FFF0F6", borderWidth: 1, borderColor: "#ECA8C9" }}>
        <CharacterArtwork source={spaPorchArtwork} style={{ width: "100%", aspectRatio: 1 }} resizeMode="cover" accessible={false} />
        <View style={{ padding: 12 }}><Text style={{ color: "#A52167", fontWeight: "900", fontSize: 18 }}>Em’s Pet Spa is open</Text>
          <Text style={{ color: "#34465E", fontSize: 14, lineHeight: 20, marginTop: 4 }}>Peek in for pampered paws, top-secret makeovers, and cookie cleanup. ›</Text></View>
      </TouchableOpacity>

      <View style={styles.heroCaptionRow}>
        <View style={styles.heroCaptionCopy}>
          <Text style={styles.heroCaptionTitle}>The porch light is on</Text>
          <Text style={styles.heroCaptionText}>{greeting} Tap Annie’s red door to come inside, or a treehouse to explore.</Text>
        </View>
        <Ionicons name="sparkles" size={20} color={palette.purple} />
      </View>

      <View style={styles.gentleLimitCard}>
        <View style={styles.gentleLimitIcon}>
          <Ionicons name="cafe" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.flexOne}>
          <Text style={styles.gentleLimitLabel}>TODAY’S GENTLE LIMIT</Text>
          <Text style={styles.gentleLimitValue}>{money(safeToSpendDaily)}/day</Text>
          <Text style={styles.gentleLimitSub}>A calm guide, not a guilt trip.</Text>
        </View>
      </View>

      <View style={[styles.dailyPosterCard, { backgroundColor: poster.soft, borderColor: poster.accent + "55" }]}>
        <View style={styles.posterTape} />
        <View style={[styles.posterImageWrap, { aspectRatio: posterAspectRatio }]}>
          <CharacterArtwork source={posterSource} style={styles.posterImage} resizeMode="contain" accessibilityLabel={`${poster.mascot} — today's PayPlace poster`} />
        </View>
        <View style={styles.posterCopy}>
          <Text style={[styles.posterMascot, { color: poster.accent }]}>TODAY’S POSTER • {poster.mascot.toUpperCase()}</Text>
          <Text style={styles.posterQuote}>{poster.quote}</Text>
          <Text style={styles.posterSub}>{poster.sub}</Text>
          <View style={[styles.posterBrandPill, { backgroundColor: poster.accent }]}>
            <Ionicons name="paw" size={13} color="white" />
            <Text style={styles.posterBrandText}>PayPlace Neighborhood</Text>
          </View>
        </View>
      </View>
    </>
  );
}


function MoneyToolBack({ destination, onBack }) {
  const label = destination === "Bills" ? "Bills & Banking" : neighborhoodLabel(destination);
  return <TouchableOpacity accessibilityRole="button"
    accessibilityLabel={destination === "Bills" ? "Back to Bills and Banking" : `Back to ${label}`}
    onPress={() => onBack(destination)} style={{ minHeight: 48, paddingHorizontal: 18, paddingVertical: 8 }}>
    <Text style={{ color: palette.purple, fontWeight: "800" }}>‹ {label}</Text>
  </TouchableOpacity>;
}

function MyFinancesScreen({
  finance,
  onEssentials,
  upcomingTotal,
  debtDueTotal,
  safeToSpend,
  safeToSpendDaily,
  switchTab,
  onDetective,
  onPayoffMethods,
  onSavings,
  onStepsChange,
}) {
  const daysUntilPayday = Math.max(Number(finance.daysUntilPayday || 0), 1);
  const unpaidBills = finance.bills.filter((bill) => bill.status !== "Paid");
  const nextBill = unpaidBills[0];
  const extraPaycheckInfo = getExtraPaycheckInfo(finance, upcomingTotal, debtDueTotal);
  const guidancePlan = getTellMeWhatToDoPlan({
    finance,
    upcomingTotal,
    debtDueTotal,
    safeToSpendDaily,
    safeToSpend,
    nextBill,
    extraPaycheckInfo,
  });
  const [guidanceVisible, setGuidanceVisible] = useState(false);

  function handleGuidanceAction() {
    setGuidanceVisible(false);
    if (guidancePlan.targetTab === "Debt") onPayoffMethods();
    else switchTab(guidancePlan.targetTab);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, styles.tabContent]}>
      <SectionTitle title="My Finances" />
      <View style={styles.safeHeroCard} testID="home-safe-to-spend">
        <Text accessibilityRole="header" style={styles.safeHeroLabel}>Safe to Spend</Text>
        <Text style={styles.safeHeroAmount} numberOfLines={1} adjustsFontSizeToFit>{money(safeToSpendDaily)}/day</Text>
        <Text style={styles.safeHeroSub}>Planning estimate · {daysUntilPayday} day{daysUntilPayday === 1 ? "" : "s"} to payday</Text>
        <View style={styles.safeHeroImageFrame}>
          <FittedArtwork source={require("./assets/characters/payplace-art-studio.png")} aspectRatio={3 / 2}
            testID="home-safe-to-spend-artwork" accessible={false} />
        </View>
      </View>
      <NavigationTiles testID="home-shortcuts" items={[
        { title: "Review my bills", source: require("./assets/characters/finances-bills-westley.jpg"), body: unpaidBills.length === 1 ? "1 unpaid bill" : `${unpaidBills.length} unpaid bills`, colors: { fill: "#65EBEF", border: "#00AABF" }, onPress: () => switchTab("Bills") },
        { title: "One small step", source: require("./assets/characters/finances-step-tate.jpg"), colors: { fill: "#DCABFF", border: "#9F3DE5" }, onPress: () => setGuidanceVisible(true) },
        { title: "Payoff methods", source: require("./assets/characters/finances-payoff-bobbie.jpg"), colors: { fill: "#FFE455", border: "#E1AC00" }, onPress: onPayoffMethods },
        { title: "Budget", source: require("./assets/characters/finances-budget-chapo.jpg"), colors: { fill: "#FFB0A4", border: "#E65D60" }, onPress: () => switchTab("Budget") },
      ]} />
      <Modal
        visible={guidanceVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGuidanceVisible(false)}
      >
        <View style={styles.overlayShell}>
          <ScrollView style={{maxHeight:"85%"}} contentContainerStyle={styles.guidanceModalCard}>
            <SmallSteps finance={finance} onChange={onStepsChange} onOpen={target => {setGuidanceVisible(false); if(target === "Savings") onSavings(); else if(target === "Subscriptions") onDetective(); else if(target === "Debt") onPayoffMethods(); else switchTab(target);}} />
            <View
              style={[
                styles.guidanceIconWrap,
                { backgroundColor: guidancePlan.tintColor, borderColor: guidancePlan.accentColor + "55" },
              ]}
            >
              <Ionicons name={guidancePlan.icon || "compass"} size={22} color={guidancePlan.accentColor} />
            </View>
            <Text style={styles.guidanceEyebrow}>PAYPLACE NEXT MOVE</Text>
            <Text style={styles.guidanceTitle}>{guidancePlan.title}</Text>
            <Text style={styles.guidanceBody}>{guidancePlan.body}</Text>

            <View style={styles.guidanceStepList}>
              {guidancePlan.steps.map((step, index) => (
                <View key={step} style={styles.guidanceStepRow}>
                  <View style={[styles.guidanceStepDot, { backgroundColor: guidancePlan.accentColor }]}>
                    <Text style={styles.guidanceStepDotText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.guidanceStepText}>{step}</Text>
                </View>
              ))}
            </View>

            <View style={styles.guidanceActionRow}>
              <TouchableOpacity
                style={[styles.secondaryActionButton, { flex: 1 }]}
                onPress={() => setGuidanceVisible(false)}
              >
                <Text style={styles.secondaryActionText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  styles.guidancePrimaryButton,
                  { backgroundColor: guidancePlan.accentColor },
                ]}
                onPress={handleGuidanceAction}
              >
                <Text style={styles.primaryButtonText}>{guidancePlan.actionLabel}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>


      <ExpandableSection title="Payday details & getting started"><FeatureLinks items={[
        {title:'Until next payday',body:'Groceries, gas and your plan.',onPress:()=>onEssentials('payday')},
        {title:'Your first win with Annie',body:'One payday, one bill, one next step.',onPress:()=>onEssentials('firstWin')},
      ]}/></ExpandableSection>
      <ExpandableSection title="Welcome & beta feedback">
        <SeasonalWelcome />
        <TesterFeedback />
      </ExpandableSection>
    </ScrollView>
  );
}

const neighborhoodTileFills = ['#FFB0A4', '#65EBEF', '#FFE455', '#DCABFF'];

function NeighborhoodMapScreen({ canRotate, reduceAnimation, paused, onOpen, weatherZip, onWeatherZip, onHelp, onSecurity, onLeaveSample, safeToSpendDaily, daysUntilPayday, showWelcome, onWelcomeSeen, children }) {
  const { width, height } = useWindowDimensions();
  const [menu, setMenu] = useState(false);
  const [resident, setResident] = useState(null);
  const weather = useNeighborhoodWeather(weatherZip);
  const season = neighborhoodWelcomeTheme(useNeighborhoodClock());
  const [openingTheme] = useState(() => showWelcome ? season : null);
  const [fullMapRequested, setFullMapRequested] = useState(false);
  const landscape = width > height;
  const fullMap = landscape || fullMapRequested;
  const choose = action => { onWelcomeSeen(); setMenu(false); setResident(null); action(); };
  return <View style={{ flex: 1, backgroundColor: "#173C50" }} testID="neighborhood-map-screen">
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, backgroundColor: "#FFF8EA" }}>
      <TouchableOpacity artworkMode="integrated" accessibilityRole="button"
        accessibilityLabel={menu ? "Close neighborhood menu" : "Open neighborhood menu"}
        accessibilityState={{ expanded: menu }} onPress={() => { onWelcomeSeen(); setResident(null); setMenu(!menu); }}
        style={{ minHeight: 44, flexDirection: "row", alignItems: "center", paddingHorizontal: 8, gap: 5 }}>
        <Ionicons name={menu ? "arrow-back" : "menu-outline"} size={25} color={palette.ink} />
          <Text style={{ fontWeight: "800", color: palette.ink }}>{menu ? "Back to map" : "Menu"}</Text>
      </TouchableOpacity>
      {!landscape && fullMapRequested && !menu && !resident && <TouchableOpacity artworkMode="integrated" accessibilityRole="button"
        accessibilityLabel="Explore the map by swiping"
        onPress={() => setFullMapRequested(false)}
        style={{ flex: 1, minHeight: 44, flexDirection: "row", alignItems: "center", paddingHorizontal: 8, gap: 5 }}>
        <Text style={{ flex: 1, color: palette.ink }}>Swipe view</Text>
      </TouchableOpacity>}
    </View>
    {!fullMap && !menu && !resident && !showWelcome && <View style={{ paddingHorizontal: 10, paddingTop: 10 }}>
      <MapRotationCue canRotate={canRotate} reduceAnimation={reduceAnimation || paused}
        onPress={() => setFullMapRequested(true)} />
    </View>}
    <View style={menu || resident ? { display: "none" } : styles.flexOne}
      accessibilityElementsHidden={menu || !!resident} importantForAccessibility={menu || resident ? "no-hide-descendants" : "auto"}>
      <LivingNeighborhood showTreehouses mapOnly fullMap={fullMap} reduceAnimation={reduceAnimation} paused={paused || menu || !!resident || showWelcome}
        onOpen={next => choose(() => onOpen(next))} sharedWeather={weather} onMeet={setResident} openingTheme={openingTheme} />
      {showWelcome && !menu && !resident && <NeighborhoodOpening theme={season} reduceAnimation={reduceAnimation} onFinish={onWelcomeSeen} />}
    </View>
    {!landscape && !fullMap && !menu && !resident && <TouchableOpacity artworkMode="integrated" accessibilityRole="button"
      accessibilityLabel={`Safe to Spend, ${money(safeToSpendDaily)} per day. Open My Finances`} onPress={() => choose(() => onOpen("Finances"))}
      style={styles.safeMapShortcut}>
      <View style={styles.safeMapCopy}>
        <Text style={styles.safeHeroLabel}>Safe to Spend</Text>
        <Text style={styles.safeMapAmount} numberOfLines={1} adjustsFontSizeToFit>{money(safeToSpendDaily)}/day</Text>
        <Text style={styles.safeHeroSub}>{Math.max(Number(daysUntilPayday || 0), 1)} {Number(daysUntilPayday) > 1 ? "days" : "day"} to payday</Text>
      </View>
      <FittedArtwork source={require("./assets/characters/money-mood-family-budget.jpg")} style={styles.safeMapArtwork}
        resizeMode="cover" testID="map-safe-to-spend-artwork" accessible={false} />
    </TouchableOpacity>}
    {resident && <ScrollView style={{ backgroundColor: "#FFF8EA" }} contentContainerStyle={{ padding: 14 }}>
      <Text accessibilityRole="header" style={{ color: palette.ink, fontSize: 20, fontWeight: "800" }}>{resident.name} · {resident.job}</Text>
      <Text style={{ color: palette.ink, marginVertical: 8 }}>{resident.activity} · {resident.place}</Text>
      {resident.companions.length > 0 && <Text style={{ color: palette.ink }}>With {resident.companions.join(", ")}</Text>}
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Visit ${resident.place}`}
        onPress={() => choose(() => onOpen(resident.destination))} style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 10 }}>
        <Text style={{ color: palette.ink, fontWeight: "800" }}>Visit {resident.place}</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to the neighborhood map"
        onPress={() => setResident(null)} style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 10 }}>
        <Text style={{ color: palette.ink, fontWeight: "800" }}>Back to the map</Text>
      </TouchableOpacity>
    </ScrollView>}
    {menu && <View style={[styles.screen, { backgroundColor: "#FFF8EA" }]}>
      <ScrollView contentContainerStyle={[styles.content, styles.tabContent]}>
        <NeighborhoodNav artworkFirst current="Home" switchTab={next => choose(() => { if (next !== "Home") onOpen(next); })} />
        {onLeaveSample && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Return to my personal plan"
          onPress={() => choose(onLeaveSample)} style={{ minHeight: 44, padding: 8 }}><Text>Return to my personal plan</Text></TouchableOpacity>}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 10 }}>
          {[
            ["Help", "How Home works", onHelp],
            ["Plans", "Open PayPlace plans", () => onOpen("Plans")],
            ["Security & backup", "Open Security & backup", onSecurity],
          ].map(([label, accessibilityLabel, action]) => <TouchableOpacity key={label} accessibilityRole="button"
            accessibilityLabel={accessibilityLabel} onPress={() => choose(action)}
            style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 10 }}>
            <Text style={{ color: palette.ink, fontWeight: "800" }}>{label}</Text>
          </TouchableOpacity>)}
        </View>
        <NavigationTiles largeArtwork items={[{title: "Bobbie’s Cabaret Show", onPress: () => choose(() => onOpen("Cabaret"))}]} />
        <NeighborhoodLinks onOpen={next => choose(() => onOpen(next))} />
        <NeighborhoodTownLife weatherZip={weatherZip} weather={weather} onOpen={next => choose(() => onOpen(next))} onWeatherZip={onWeatherZip} />
        {children}
      </ScrollView>
    </View>}
  </View>;
}

function NeighborhoodLinks({ onOpen }) {
  return <>
    <Text style={styles.sectionSubtitle}>Swipe for places to visit.</Text>
    <NavigationTiles testID="neighborhood-destinations" horizontal largeArtwork items={NEIGHBOR_DESTINATIONS.map((place, index) => ({
      title: place.label,
      source: buildingArtwork(place.id),
      colors: { fill: neighborhoodTileFills[index % neighborhoodTileFills.length], border: place.color },
      onPress: () => onOpen(place.id),
    }))} />
  </>;
}

function BillsScreen({ bills, addBill, updateBill, toggleBillPaid, reviewBill, deleteBill, onHistory, onSubscriptions, onBilliam, onBankingDemo, onBankLinking, onDebt, onMicropayments, onMonthlyCalendar }) {
  const [addingBill, setAddingBill] = useState(false);
  const [newBill, setNewBill] = useState({
  name: "",
  due: "",
  amount: "",
  paymentMethod: "Manual",
  paymentAddress: "",
  accountNumberLast4: "",
  notes: "",
});

const [importSuggestions, setImportSuggestions] = useState([]);

const [selectedReviewBill, setSelectedReviewBill] = useState(null);
const [editingReviewBill, setEditingReviewBill] = useState(null);

const closeReviewModal = () => {
  setSelectedReviewBill(null);
  setEditingReviewBill(null);
};

const openReviewModal = (bill) => {
  setSelectedReviewBill(bill);
  setEditingReviewBill(null);
};

const startEditingReviewBill = () => {
  if (!selectedReviewBill) return;

  setEditingReviewBill({
    ...selectedReviewBill,
    name: selectedReviewBill.name || "",
    amount: String(selectedReviewBill.amount ?? ""),
    due: selectedReviewBill.due || selectedReviewBill.dueDate || "",
    dueDate: selectedReviewBill.dueDate || selectedReviewBill.due || "",
    paymentMethod: selectedReviewBill.paymentMethod || "Manual",
    accountNumberLast4: selectedReviewBill.accountNumberLast4 || "",
    paymentAddress: selectedReviewBill.paymentAddress || "",
    notes: selectedReviewBill.notes || "",
  });
};

const saveEditedReviewBill = () => {
  if (!editingReviewBill) return;

  const amount = cleanNumber(editingReviewBill.amount);

  if (!editingReviewBill.name || !editingReviewBill.name.trim()) {
    Alert.alert("Missing bill name", "Give the bill a name first.");
    return;
  }

  if (amount <= 0) {
    Alert.alert("Missing amount", "Add a bill amount greater than zero.");
    return;
  }

  const updatedBill = {
    ...selectedReviewBill,
    ...editingReviewBill,
    name: editingReviewBill.name.trim(),
    amount: amount.toFixed(2),
    due: editingReviewBill.due || editingReviewBill.dueDate || "Jun 15",
    dueDate: editingReviewBill.dueDate || editingReviewBill.due || "Jun 15",
    status: editingReviewBill.status || selectedReviewBill.status || "Upcoming",
    paymentMethod: editingReviewBill.paymentMethod || "Manual",
    paymentAddress: editingReviewBill.paymentAddress || "",
    accountNumberLast4: editingReviewBill.accountNumberLast4 || "",
    notes: editingReviewBill.notes || "",
    source: editingReviewBill.source || selectedReviewBill.source || "Manual entry",
    confidence: editingReviewBill.confidence || selectedReviewBill.confidence || "Confirmed",
  };

  updateBill(updatedBill);
  setSelectedReviewBill(updatedBill);
  setEditingReviewBill(null);
};

const importDemoBills = () => {
  const newSuggestions = DEMO_IMPORTED_BILLS.filter(
    (demoBill) =>
      !bills.some((existingBill) => existingBill.name === demoBill.name) &&
      !importSuggestions.some(
        (suggestion) => suggestion.name === demoBill.name
      )
  );

  if (newSuggestions.length === 0) {
    Alert.alert(
      "Already imported",
      "These demo bills are already in your list."
    );
    return;
  }

  setImportSuggestions(newSuggestions);

  Alert.alert(
    "Review sample bills",
    "These are sample bills for trying the review flow. Add your actual bills manually."
  );
};

  function submitBill() {
    addBill(newBill);
    setNewBill({
      name: "",
      due: "",
      amount: "",
      paymentMethod: "Manual",
      paymentAddress: "",
      accountNumberLast4: "",
      notes: "",
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, styles.tabContent]}>
      <SectionTitle title="Bills & Banking" />
      <NavigationTiles testID="bills-shortcuts" items={[
        { title: 'Add a bill', accessibilityLabel: 'Add a bill',
          source: require("./assets/characters/bills-add-billiam.jpg"),
          colors: { fill: '#FFE455', border: '#BA8500' }, onPress: () => setAddingBill(true) },
        { title: 'Monthly payment calendar', source: require("./assets/characters/bills-calendar-billiam.jpg"),
          colors: { fill: '#DCABFF', border: '#9F3DE5' }, onPress: onMonthlyCalendar },
      ]} />
      <ExpandableSection title="Bill tools, debt & payments">
        <NavigationTiles items={[
          {title:'Billiam’s bill tools',onPress:onBilliam},
          {title:'My debt plan',onPress:onDebt},
          {title:'Undo & payment history',onPress:onHistory},
        ]} />
        <MicropaymentsButton forBills onPress={onMicropayments} />
      </ExpandableSection>
      <ExpandableSection title="Banking & subscriptions">
        <NavigationTiles items={[
          {title:'Banking Demo',source:require('./assets/characters/banking-demo-tile.jpg'),body:'Sample accounts',onPress:onBankingDemo},
          {title:'Subscription Detective',body:'Premium',onPress:onSubscriptions},
        ]} />
        <Text style={styles.bankingManualNote}>You can add subscriptions manually as bills in any plan.</Text>
        {onBankLinking && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Plaid bank-linking availability"
          style={styles.primaryButtonTight} onPress={onBankLinking}>
          <Text style={styles.primaryButtonText}>Plaid bank linking · Premium availability</Text>
        </TouchableOpacity>}
      </ExpandableSection>


{selectedReviewBill && (
  <Modal
    visible={true}
    transparent={true}
    animationType="fade"
    onRequestClose={closeReviewModal}
  >
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(7, 18, 40, 0.55)",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 32,
          padding: 24,
          borderWidth: 1,
          borderColor: "#DCEAF7",
          maxHeight: "88%",
        }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.formTitle}>
            {editingReviewBill ? "Edit Bill Details" : `Review: ${selectedReviewBill.name}`}
          </Text>

          {editingReviewBill ? (
            <View>
              <InputField
                label="Bill name"
                value={editingReviewBill.name}
                placeholder="Rent, electric, phone..."
                onChangeText={(text) =>
                  setEditingReviewBill((current) => ({ ...current, name: text }))
                }
              />

              <InputField
                label="Due date"
                value={editingReviewBill.due}
                placeholder="YYYY-MM-DD"
                onChangeText={(text) =>
                  setEditingReviewBill((current) => ({
                    ...current,
                    due: text,
                    dueDate: text,
                  }))
                }
              />

              <InputField
                label="Amount"
                value={editingReviewBill.amount}
                placeholder="125.00"
                keyboardType="decimal-pad"
                onChangeText={(text) =>
                  setEditingReviewBill((current) => ({ ...current, amount: text }))
                }
              />

              <InputField
                label="Payment method"
                value={editingReviewBill.paymentMethod}
                placeholder="Manual, autopay, check..."
                onChangeText={(text) =>
                  setEditingReviewBill((current) => ({
                    ...current,
                    paymentMethod: text,
                  }))
                }
              />

              <InputField
                label="Account ending in last 4"
                value={editingReviewBill.accountNumberLast4}
                placeholder="1234"
                keyboardType="numeric"
                onChangeText={(text) =>
                  setEditingReviewBill((current) => ({
                    ...current,
                    accountNumberLast4: text,
                  }))
                }
              />

              <InputField
                label="Payment address"
                value={editingReviewBill.paymentAddress}
                placeholder="PO Box, mailing address, or payment website"
                multiline
                numberOfLines={4}
                onChangeText={(text) =>
                  setEditingReviewBill((current) => ({
                    ...current,
                    paymentAddress: text,
                  }))
                }
              />

              <InputField
                label="Notes"
                value={editingReviewBill.notes}
                placeholder="Portal login hint, confirmation info, anything helpful..."
                multiline
                numberOfLines={4}
                onChangeText={(text) =>
                  setEditingReviewBill((current) => ({ ...current, notes: text }))
                }
              />

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: "#18C4AD" }]}
                  onPress={saveEditedReviewBill}
                >
                  <Text style={styles.smallButtonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: palette.muted }]}
                  onPress={() => setEditingReviewBill(null)}
                >
                  <Text style={styles.smallButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.billMeta}>
                Amount: {money(selectedReviewBill.amount)}
              </Text>

              <Text style={styles.billMeta}>
                Due date: {selectedReviewBill.dueDate || selectedReviewBill.due || "Not added yet"}
              </Text>

              <Text style={styles.billMeta}>
                Payment method: {selectedReviewBill.paymentMethod || "Manual"}
              </Text>

              <View
                style={{
                  marginTop: 18,
                  backgroundColor: "#F6FBFF",
                  borderColor: "#DCEAF7",
                  borderWidth: 1,
                  borderRadius: 22,
                  padding: 16,
                }}
              >
                <Text style={styles.inputLabel}>Account</Text>
                <Text style={styles.billMeta}>
                  {selectedReviewBill.accountNumberLast4
                    ? `Account ending in ${selectedReviewBill.accountNumberLast4}`
                    : "Not added yet"}
                </Text>
              </View>

              <View
                style={{
                  marginTop: 12,
                  backgroundColor: "#F6FBFF",
                  borderColor: "#DCEAF7",
                  borderWidth: 1,
                  borderRadius: 22,
                  padding: 16,
                }}
              >
                <Text style={styles.inputLabel}>Payment address</Text>
                <Text style={styles.billMeta}>
                  {selectedReviewBill.paymentAddress || "Not added yet"}
                </Text>
              </View>

              <View
                style={{
                  marginTop: 12,
                  backgroundColor: "#F6FBFF",
                  borderColor: "#DCEAF7",
                  borderWidth: 1,
                  borderRadius: 22,
                  padding: 16,
                }}
              >
                <Text style={styles.inputLabel}>Notes</Text>
                <Text style={styles.billMeta}>
                  {selectedReviewBill.notes || "No notes yet"}
                </Text>
              </View>

              <View style={{ marginTop: 18 }}>
                <Text style={styles.billMeta}>
                  Source: {selectedReviewBill.source || "Manual entry"}
                </Text>
                <Text style={styles.billMeta}>
                  Confidence: {selectedReviewBill.confidence || "Confirmed"}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: palette.purple }]}
                  onPress={startEditingReviewBill}
                >
                  <Text style={styles.smallButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: "#18C4AD" }]}
                  onPress={closeReviewModal}
                >
                  <Text style={styles.smallButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  </Modal>
)}

      {bills.length === 0 ? (
        <EmptyCard text="No bills yet. Tap Add bill when you’re ready." />
      ) : (
        bills.map((bill) => (
          <View key={bill.id} style={styles.billCard}>
            <BillRow bill={bill} />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.smallButton,
                  { backgroundColor: bill.status === "Paid" ? palette.muted : palette.teal },
                ]}
                onPress={() => toggleBillPaid(bill.id)}
              >
                <Text style={styles.smallButtonText}>
                  {bill.status === "Paid" || bill.paid ? "Undo record" : "Record payment"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
  style={[styles.smallButton, { backgroundColor: palette.goldDark }]}
  onPress={() => openReviewModal(bill)}
>
  <Text style={styles.smallButtonText}>Review</Text>
</TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button" accessibilityLabel={`Remove ${bill.name}`}
                style={[styles.smallButton, { backgroundColor: palette.blush }]}
                onPress={() => deleteBill(bill.id)}
              >
                <Text style={{color:palette.coralDark,fontWeight:'900'}}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
      <EntrySheet visible={addingBill} title="Add a bill" onClose={() => setAddingBill(false)}>
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Add a bill</Text>

        <InputField
          label="Bill name"
          value={newBill.name}
          placeholder="Rent, electric, phone..."
          onChangeText={(text) => setNewBill({ ...newBill, name: text })}
        />

        <InputField
          label="Due date"
          value={newBill.due}
          placeholder="YYYY-MM-DD"
          onChangeText={(text) => setNewBill({ ...newBill, due: text })}
        />

        <InputField
          label="Amount"
          value={newBill.amount}
          placeholder="125.00"
          keyboardType="decimal-pad"
          onChangeText={(text) => setNewBill({ ...newBill, amount: text })}
        />

<InputField
  label="Payment method"
  value={newBill.paymentMethod}
  placeholder="Manual, autopay, check..."
  onChangeText={(text) =>
    setNewBill((current) => ({
      ...current,
      paymentMethod: text,
    }))
  }
/>

<InputField
  label="Account ending in last 4"
  value={newBill.accountNumberLast4}
  placeholder="1234"
  keyboardType="numeric"
  onChangeText={(text) =>
    setNewBill((current) => ({
      ...current,
      accountNumberLast4: text,
    }))
  }
/>

<InputField
  label="Payment address"
  value={newBill.paymentAddress}
  placeholder="PO Box, mailing address, or payment website"
  multiline
  numberOfLines={4}
  onChangeText={(text) =>
    setNewBill((current) => ({
      ...current,
      paymentAddress: text,
    }))
  }
/>

<InputField
  label="Notes"
  value={newBill.notes}
  placeholder="Portal login hint, confirmation info, anything helpful..."
  multiline
  numberOfLines={4}
  onChangeText={(text) =>
    setNewBill((current) => ({
      ...current,
      notes: text,
    }))
  }
/>

        <View
          style={[
            styles.billActionImageFrame,
            styles.addBillImageFrame,

          ]}
        >
          <CharacterArtwork
            source={imageSource(addBillTateGraphic)}
            style={styles.billActionImage}
            resizeMode="contain"
            accessibilityLabel="Tate driving his blue PayPlace convertible with his long goofy tongue in the breeze"
          />
          <View style={styles.billActionImageBadge}>
            <Ionicons name="create" size={15} color={palette.ink} />
            <Text style={styles.billActionImageBadgeText}>Manual add</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButtonTight} onPress={submitBill}>
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Add bill</Text>
        </TouchableOpacity>

        <BilliamShortcut onPress={onBilliam} />

        <TouchableOpacity artworkMode="integrated" accessibilityRole="button" accessibilityLabel="Try sample bill review"
          style={styles.sampleBillsShortcut} onPress={importDemoBills}>
          <FittedArtwork source={imageSource(importBillsWestleyGraphic)} aspectRatio={4 / 3}
            testID="sample-bills-shortcut-artwork" resizeMode="cover" accessible={false} />
          <View style={styles.sampleBillsCopy}>
            <Text style={styles.sampleBillsTitle}>Try sample bill review</Text>
            <Text style={styles.cardSub}>Practice with fictional bills.</Text>
          </View>
        </TouchableOpacity>

</View>

{importSuggestions.length > 0 && (
  <View style={styles.formCard}>
    <Text style={styles.formTitle}>Review Sample Bills</Text>

    <Text style={styles.helperText}>
      These sample bills let you try the review flow. They aren't pulled from your bank.
    </Text>

    {importSuggestions.map((bill, index) => (
      <View key={`${bill.id}_${index}`} style={styles.billCard}>
        <View style={styles.billTopRow}>
          <View>
            <Text style={styles.billName}>{bill.name}</Text>

            <Text style={styles.billMeta}>
              Estimated: ${bill.amount} monthly
            </Text>

            <Text style={styles.billMeta}>
              {bill.notes || "Detected from connected account"}
            </Text>

            <Text style={styles.billMeta}>
              Confidence: {bill.confidence || "Review needed"}
            </Text>
          </View>
        </View>

 <View style={styles.actionRow}>
  <TouchableOpacity
    style={[styles.smallButton, { backgroundColor: "#18C4AD" }]}
    onPress={() => {
      addBill({
        ...bill,
        id: `${bill.id}_${Date.now()}_${index}`,
        due: bill.due || bill.dueDate || "Jun 15",
        dueDate: bill.dueDate || bill.due || "Jun 15",
        status: bill.status || "Upcoming",
      });

      setImportSuggestions((current) =>
        current.filter((suggestion) => suggestion.name !== bill.name)
      );

      Alert.alert("Bill added", `${bill.name} was added to your bills.`);
    }}
  >
    <Text style={styles.smallButtonText}>Add Bill</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.smallButton, { backgroundColor: palette.muted }]}
    onPress={() => {
      setImportSuggestions((current) =>
        current.filter((suggestion) => suggestion.name !== bill.name)
      );

      Alert.alert("Import ignored", `${bill.name} was not added.`);
    }}
  >
    <Text style={styles.smallButtonText}>Ignore</Text>
  </TouchableOpacity>
</View>
      </View>
    ))}
  </View>
)}

      </EntrySheet>
    </ScrollView>
  );
}

function BudgetScreen({
  finance,
  upcomingTotal,
  safeToSpend,
  updateNumber,
  updateText,
  resetDemoData,
  onPayday, onCalendar, onSavings, onCategories, onOutlook,
}) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, styles.tabContent]}>
      <SectionTitle title="Budget" />
      <View style={styles.safeSpendCard}>
        <Text style={styles.cardLabelLight}>Safe to Spend</Text>
        <Text style={styles.safeSpendNumber} numberOfLines={1} adjustsFontSizeToFit>
          {money(safeToSpend)}
        </Text>
        <Text style={styles.safeSpendSub}>
          Balance minus unpaid bills, debt minimums and your emergency buffer.
        </Text>

        <View style={styles.safeMiniGrid}>
          <SafeMiniCard
            label="Balance"
            value={money(finance.balance)}
            backgroundColor={palette.purple}
            borderColor="#AFA4FF"
            labelColor="white"
            valueColor={palette.mintBright}
          />
          <SafeMiniCard
            label="Bills"
            value={money(upcomingTotal)}
            backgroundColor={palette.gold}
            borderColor="#FFE78A"
            labelColor={palette.ink}
            valueColor={palette.ink}
          />
        </View>
      </View>

      <ExpandableSection title="Edit money info" artworkAction="editBudget" compact>
      <View style={styles.formCard}>
        <InputField
          label="Current bank balance"
          value={String(finance.balance)}
          currency
          keyboardType="decimal-pad"
          onChangeText={(text) => updateNumber("balance", text)}
        />

        <InputField
          label="Next paycheck amount"
          value={String(finance.nextPaycheck)}
          currency
          keyboardType="decimal-pad"
          onChangeText={(text) => updateNumber("nextPaycheck", text)}
        />

        <InputField
          label="Next payday date"
          value={finance.nextPaycheckDate || ""}
          placeholder="2026-06-10"
          onChangeText={(text) => updateText("nextPaycheckDate", text)}
        />

        <InputField
          label="Pay frequency"
          value={finance.payFrequency || "Biweekly"}
          placeholder="Weekly, biweekly, twice monthly, monthly"
          onChangeText={(text) => updateText("payFrequency", text)}
        />

        {scheduleSettings(finance.payFrequency).kind === "semi" && <InputField
          label="Second payday day (1–31; 31 means month end)"
          value={String(finance.secondPaydayDay || "")}
          keyboardType="number-pad"
          placeholder="Leave blank to estimate from next payday"
          onChangeText={text => updateText("secondPaydayDay", text)}
        />}

        <InputField
          label="Days until payday"
          value={String(finance.daysUntilPayday)}
          keyboardType="number-pad"
          onChangeText={(text) => updateNumber("daysUntilPayday", text)}
        />

        <InputField
          label="Daily allowance"
          value={String(finance.allowance)}
          currency
          keyboardType="decimal-pad"
          onChangeText={(text) => updateNumber("allowance", text)}
        />

        <InputField
          label="Emergency buffer"
          value={String(finance.buffer)}
          currency
          keyboardType="decimal-pad"
          onChangeText={(text) => updateNumber("buffer", text)}
        />


      </View>

      </ExpandableSection>
      {onCategories && <CategoryEntry onOpen={onCategories} compact />}
      <ExpandableSection title="Paydays & savings">
        {onOutlook && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open Money outlook"
          onPress={onOutlook} style={styles.primaryButtonTight}>
          <Text style={styles.primaryButtonText}>Money outlook</Text>
        </TouchableOpacity>}
        <NavigationTiles items={[
          {title:'Until next payday',artworkAction:'budgetPayday',onPress:onPayday},
          {title:'Extra Paycheck Calendar',onPress:onCalendar},
          {title:'Savings Goals',onPress:onSavings},
        ]} />
      </ExpandableSection>
      <ExpandableSection title="Budget data settings">
        <View style={styles.noteCard}>
          <Ionicons name="save" size={22} color={palette.purple} />
          <Text style={styles.noteText}>
            PayPlace encrypts your entries on this device. Use Security & backup to save a portable, password-protected copy.
          </Text>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={resetDemoData}>
          <Ionicons name="refresh-circle" size={20} color={palette.coralDark} />
          <Text style={styles.resetButtonText}>Reset demo data</Text>
        </TouchableOpacity>
      </ExpandableSection>
    </ScrollView>
  );
}

function DebtScreen({ debts, showPayoffStrategy, onMicropayments, payoffMode, mixedQuickWinId, setPayoffMode, addDebt, payDebt, deleteDebt }) {
  const [addingDebt, setAddingDebt] = useState(false);
  const [newDebt, setNewDebt] = useState({
    name: "",
    balance: "",
    apr: "",
    minimum: "",
  });

  const mode = normalizeStrategy(payoffMode);
  const sortedDebts = orderDebts(debts, mode, mixedQuickWinId);
  const targetDebt = sortedDebts[0];
  const mixedQuickWin = mode === "mixed" && targetDebt?.id === mixedQuickWinId;
  const modeColor = mode === "mixed" ? palette.purple : mode === "snowball" ? palette.snowballDark : palette.avalancheDark;
  const modeSoft = mode === "mixed" ? palette.lavender : mode === "snowball" ? palette.snowballSoft : palette.avalancheSoft;

  function submitDebt() {
    addDebt(newDebt);
    setNewDebt({ name: "", balance: "", apr: "", minimum: "" });
  }

  const payoffTools = (
    <>
      <MicropaymentsButton onPress={onMicropayments} />
      <View style={styles.payoffToggleCard}>
        <Text style={styles.payoffToggleTitle}>Choose your payoff strategy</Text>

        <View style={styles.payoffModeList}>
          {[
            { id: "snowball", title: "Snowball", subtitle: "Quick wins first", artwork: snowballBuddyGraphic, artworkRatio: 589 / 582, color: palette.snowballDark, tint: palette.snowballSoft },
            { id: "mixed", title: "Mixed", subtitle: "Best of both", artwork: mixedBuddyGraphic, artworkRatio: 1122 / 1402, color: palette.purple, tint: palette.lavender },
            { id: "avalanche", title: "Avalanche", subtitle: "Save more on interest", artwork: avalancheBuddyGraphic, artworkRatio: 556 / 485, color: palette.avalancheDark, tint: palette.avalancheSoft },
          ].map(option => <TouchableOpacity key={option.id} testID={`payoff-method-${option.id}`}
            artworkMode="integrated" accessibilityRole="button" accessibilityLabel={`${option.title}: ${option.subtitle}`}
            accessibilityState={{ selected: mode === option.id }}
            style={[styles.payoffModeButton, { borderColor: option.color, backgroundColor: option.tint }, mode === option.id && styles.payoffModeButtonActive]}
            onPress={() => setPayoffMode(option.id)}>
            <FittedArtwork source={option.artwork} aspectRatio={option.artworkRatio} resizeMode="cover" accessible={false} />
            <View style={styles.payoffModeCaption}>
              <Text style={[styles.payoffModeTitle, { color: option.color }]}>{option.title}</Text>
              <Text style={styles.payoffModeSub}>{option.subtitle}</Text>
            </View>
          </TouchableOpacity>)}
        </View>
      </View>

      <DebtBuddyScene mode={mode} />

      <View style={[styles.methodTipCard, { borderColor: modeColor + "55" }]}>
        <Ionicons
          name={mode === "mixed" ? "shuffle" : mode === "snowball" ? "happy" : "flash"}
          size={20}
          color={modeColor}
        />
        <Text style={styles.methodTipText}>
          {mode === "mixed" ? "Mixed starts with one small win, then follows Avalanche. Your quick-win target is saved with your plan."
            : mode === "snowball" ? "Snowball is for momentum: smallest debt first, quick progress, less avoidance."
            : "Avalanche is for interest: highest APR first, strongest long-term math."}
        </Text>
      </View>

      {targetDebt ? (
        <View
          style={[
            styles.recommendationCard,
            { backgroundColor: modeSoft, borderColor: modeColor + "55" },
          ]}
        >
          <Text style={[styles.recommendationEyebrow, { color: modeColor }]}>
            Recommended next move
          </Text>
          <Text style={styles.recommendationTitle}>{targetDebt.name}</Text>
          <Text style={styles.recommendationText}>
            {mixedQuickWin ? `${targetDebt.name} is your saved quick-win target. Keep paying minimums everywhere; after this balance reaches zero, Mixed follows the highest APR.`
              : mode === "mixed" ? `Your quick-win stage is complete. ${targetDebt.name} is now the highest-APR target. Keep paying minimums everywhere and aim extra money here.`
              : mode === "snowball" ? `${targetDebt.name} is the smallest target. Pay minimums everywhere, then throw extra money here so you can get a fast payoff win.`
              : `${targetDebt.name} has the highest APR. Pay minimums everywhere, then throw extra money here so interest has fewer places to snack on your cash.`}
          </Text>
        </View>
      ) : null}
    </>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionTitle
        title={showPayoffStrategy ? "Payoff methods" : "Debt Plan"}
        artwork={require("./assets/characters/header-debt-bobbie-tate.png")}
        artworkLabel="Bobbie and Tate plan their next step up the debt climb"
        subtitle={
          mode === "mixed" ? "Mixed mode: one quick win, then highest interest first."
            : mode === "snowball" ? "Snowball mode: smallest balance first for quick wins."
            : "Avalanche mode: highest APR first to attack interest."
        }
      />

      {showPayoffStrategy && payoffTools}

      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Add a debt" style={styles.primaryButtonTight} onPress={() => setAddingDebt(true)}>
        <Text style={styles.primaryButtonText}>Add debt</Text>
      </TouchableOpacity>

      {sortedDebts.length === 0 ? (
        <EmptyCard text="No debts entered yet. Tap Add debt when you’re ready; we’ll help choose your next target." />
      ) : (
        sortedDebts.map((debt, index) => (
          <View key={debt.id} style={styles.debtCard}>
            <View style={styles.debtHeader}>
              <View style={styles.flexOne}>
                <Text style={[styles.debtRank, { color: modeColor }]}>
                  Priority #{index + 1}
                </Text>
                <Text style={styles.debtName}>{debt.name}</Text>
              </View>

              {index === 0 ? (
                <View style={[styles.targetBadge, { backgroundColor: modeSoft }]}>
                  <Text style={[styles.targetBadgeText, { color: modeColor }]}>
                    Target
                  </Text>
                </View>
              ) : null}

              <View style={styles.aprPill}>
                <Text style={styles.aprText}>{Number(debt.apr || 0)}% APR</Text>
              </View>
            </View>

            <Text style={styles.debtBalance}>{money(debt.balance)}</Text>
            <Text style={styles.cardSub}>Minimum payment: {money(debt.minimum)}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.smallButton, { backgroundColor: modeColor }]}
                onPress={() => payDebt(debt.id, 25)}
              >
                <Text style={styles.smallButtonText}>Pay $25</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallButton, { backgroundColor: palette.purple }]}
                onPress={() => payDebt(debt.id, 100)}
              >
                <Text style={styles.smallButtonText}>Pay $100</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button" accessibilityLabel={`Remove ${debt.name}`}
                style={[styles.smallButton, { backgroundColor: palette.blush }]}
                onPress={() => deleteDebt(debt.id)}
              >
                <Text style={{color:palette.coralDark,fontWeight:'900'}}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
      {!showPayoffStrategy && (
        <ExpandableSection title="Payoff strategy & guidance" artworkAction="payoffGuide">
          {payoffTools}
        </ExpandableSection>
      )}
      <EntrySheet visible={addingDebt} title="Add a debt" onClose={() => setAddingDebt(false)}>
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Add a debt</Text>

        <View
          style={[
            styles.billActionImageFrame,
            styles.debtAddImageFrame,

          ]}
        >
          <CharacterArtwork
            source={imageSource(addDebtMascotsGraphic)}
            style={styles.billActionImage}
            resizeMode="contain"
            accessibilityLabel={portraits.together.label}
          />
          <View style={styles.billActionImageBadge}>
            <Ionicons name="cash" size={15} color={palette.ink} />
            <Text style={styles.billActionImageBadgeText}>Payoff plan</Text>
          </View>
        </View>

        <InputField
          label="Debt name"
          value={newDebt.name}
          placeholder="Credit card, loan..."
          onChangeText={(text) => setNewDebt({ ...newDebt, name: text })}
        />

        <InputField
          label="Balance"
          value={newDebt.balance}
          placeholder="2840"
          keyboardType="decimal-pad"
          onChangeText={(text) => setNewDebt({ ...newDebt, balance: text })}
        />

        <InputField
          label="APR"
          value={newDebt.apr}
          placeholder="26.9"
          keyboardType="decimal-pad"
          onChangeText={(text) => setNewDebt({ ...newDebt, apr: text })}
        />

        <InputField
          label="Minimum payment"
          value={newDebt.minimum}
          placeholder="75"
          keyboardType="decimal-pad"
          onChangeText={(text) => setNewDebt({ ...newDebt, minimum: text })}
        />

        <TouchableOpacity style={styles.primaryButtonTight} onPress={submitDebt}>
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Add debt</Text>
        </TouchableOpacity>
      </View>

      </EntrySheet>
    </ScrollView>
  );
}

function DebtBuddyScene({ mode }) {
  const isSnowball = mode === "snowball";
  const isMixed = mode === "mixed";
  const sceneTitle = isMixed ? "Mixed method" : isSnowball ? "Snowball method" : "Avalanche method";
  const sceneBody = isMixed ? "Best of both: a quick win to get moving, then focus on interest. Bobbie may have caused the avalanche." : isSnowball
    ? "Smallest balance first. Fast wins. Your brain gets proof that the plan is working."
    : "Highest APR first. Less interest. Tiny chihuahua panic, grown-up math.";

  const heroColor = isMixed ? palette.purple : isSnowball ? palette.snowballDark : palette.avalancheDark;
  const heroTint = isMixed ? palette.lavender : isSnowball ? palette.snowballSoft : palette.avalancheSoft;
  const bullets = isSnowball
    ? [
        {
          color: palette.purple,
          title: "Start with the smallest balance.",
          body: "Pay minimums on everything else, then send extra money to the littlest debt.",
        },
        {
          color: palette.mintBright,
          title: "Roll the old payment forward.",
          body: "When one debt is gone, its payment joins the next target.",
        },
        {
          color: palette.gold,
          title: "Best for motivation.",
          body: "Choose Snowball when quick wins help you stay in the game.",
        },
      ]
    : [
        {
          color: palette.blue,
          title: "Start with the highest APR.",
          body: "Pay minimums on everything else, then attack the debt charging the most interest.",
        },
        {
          color: palette.mint,
          title: "Save more interest over time.",
          body: "The wins can feel slower, but the math gets sharper teeth.",
        },
        {
          color: palette.purple,
          title: "Best for interest damage.",
          body: "Choose Avalanche when saving the most money matters more than quick emotional wins.",
        },
      ];

  return (
    <View
      style={[
        styles.debtBuddyCard,
        {
          backgroundColor: heroTint,
          borderColor: heroColor + "66",
        },
      ]}
    >
      <View style={styles.debtBuddyHeader}>
        <View
          style={[
            styles.debtBuddyBadge,
            { backgroundColor: "white", borderColor: heroColor + "44" },
          ]}
        >
          <Ionicons
            name={isMixed ? "shuffle" : isSnowball ? "ellipse" : "triangle"}
            size={24}
            color={heroColor}
          />
        </View>
        <View style={styles.flexOne}>
          <Text style={[styles.debtBuddyKicker, { color: heroColor }]}>
            {isMixed ? "BEST OF BOTH" : isSnowball ? "QUICK WINS" : "INTEREST ATTACK"}
          </Text>
          <Text style={styles.debtBuddyTitle}>{sceneTitle}</Text>
          <Text style={styles.debtBuddyBody}>{sceneBody}</Text>
        </View>
      </View>

      {isMixed ? <DebtMethodComparison /> : <View style={styles.methodCard}>
        {bullets.map((item) => (
          <View key={item.title} style={styles.methodBulletRow}>
            <View style={[styles.methodBallBullet, { backgroundColor: item.color }]} />
            <View style={styles.flexOne}>
              <Text style={styles.methodBulletTitle}>{item.title}</Text>
              <Text style={styles.methodBulletText}>{item.body}</Text>
            </View>
          </View>
        ))}
      </View>}
    </View>
  );
}

const calmStorySpots = {
  westley: { left: '5%', top: '39%', width: '25%', height: '21%' },
  tate: { left: '34%', top: '72%', width: '33%', height: '23%' },
  bobbie: { left: '73%', top: '23%', width: '25%', height: '24%' },
  chapo: { left: '57%', top: '40%', width: '30%', height: '23%' },
  together: { left: '31%', top: '7%', width: '35%', height: '28%' },
};

function CalmScreen({ pearl, count, nextPearl, category, collections, categoryOrder, selectCategory }) {
  const collection = collections[category];
  const scroll = useRef(null);
  const storyTop = useRef(0);
  return (
    <ScrollView ref={scroll} style={styles.screen} contentContainerStyle={[styles.content, styles.tabContent]}>
      <View style={styles.storyHero}>
        <View style={styles.storyHeroIcon}>
          <Ionicons name="leaf" size={22} color="white" />
        </View>
        <View style={styles.flexOne}>
          <Text style={styles.storyEyebrow}>NEIGHBORHOOD STORIES • CALM GARDEN</Text>
          <Text style={styles.storyHeroTitle}>Take a breath. You’re home.</Text>
        </View>
      </View>

      <View style={{ width: "100%", aspectRatio: 4 / 5, borderRadius: 26, overflow: "hidden", marginBottom: 8 }}>
        <CalmGardenScene>
          <RoomDestinations destinations={categoryOrder.map(key => ({
            label: `Open ${collections[key].label} stories`, caption: collections[key].label, area: calmStorySpots[key],
            open: () => { selectCategory(key); scroll.current?.scrollTo?.({ y: storyTop.current, animated: false }); },
          }))} />
        </CalmGardenScene>
        <RoomVisitors destination="Calm" />
      </View>
      <Text style={styles.sectionSubtitle}>Tap a marked spot for a story.</Text>

      <View style={styles.storyCard} onLayout={event => { storyTop.current = event.nativeEvent.layout.y; }}>
        <View style={styles.storyHeading}>
          <Text style={styles.storyCollectionTitle}>{collection.subtitle || `${collection.label} Neighborhood Stories`}</Text>
          <Text style={styles.storyTitle} accessibilityRole="header">{pearl.title}</Text>
        </View>
        <CalmGardenStory key={pearl.id} pearl={pearl} collectionLabel={collection.label} />
      </View>

      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Show me another story" style={styles.primaryButton} onPress={nextPearl}>
        <Ionicons name="sparkles" size={20} color="white" />
        <Text style={styles.primaryButtonText}>Show me another story</Text>
      </TouchableOpacity>

      <Text style={styles.storyCountNote}>You tapped overwhelmed {count} time{count === 1 ? "" : "s"}. No judgment. We’re still here.</Text>

    </ScrollView>
  );
}

function QuickCard({ artwork, label, value, sub, theme, onPress }) {
  return (
    <TouchableOpacity artworkMode="integrated"
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}. ${sub}`}
      style={[styles.quickCard, { backgroundColor: theme.background, borderColor: theme.border }]}
      onPress={onPress}
    >
      <View style={styles.quickArtworkFrame}>
        <CharacterArtwork source={artwork} style={styles.quickArtwork} resizeMode="contain" accessible={false} />
      </View>
      <Text style={[styles.quickLabel, { color: theme.text }]}>{label}</Text>
      <Text style={[styles.quickValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.55}>{value}</Text>
      <Text style={[styles.quickSub, { color: theme.text }]}>{sub}</Text>
    </TouchableOpacity>
  );
}

function SafeMiniCard({
  label,
  value,
  backgroundColor = palette.purple,
  borderColor = "#AFA4FF",
  labelColor = "white",
  valueColor = palette.gold,
}) {
  return (
    <View
      style={[
        styles.safeMiniCard,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <Text style={[styles.safeMiniLabel, { color: labelColor }]}>{label}</Text>
      <Text
        style={[styles.safeMiniValue, { color: valueColor }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.35}
      >
        {value}
      </Text>
    </View>
  );
}

function MiniStat({ label, value, tone }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text
        style={[styles.miniValue, { color: tone }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.55}
      >
        {value}
      </Text>
    </View>
  );
}

function BillRow({ bill }) {
  const paid = bill.status === "Paid";

  return (
    <View style={[styles.billRow, paid && { backgroundColor: cardThemes.mint.background, borderColor: cardThemes.mint.border }]}>
      <View
        style={[
          styles.billDot,
          { backgroundColor: paid ? "#087E70" : palette.ink },
        ]}
      />

      <View style={styles.flexOne}>
        <Text style={styles.billName}>{bill.name}</Text>
        <Text style={styles.billMeta}>
  Due {bill.due || bill.dueDate} - {bill.status}
</Text>

{bill.accountNumberLast4 ? (
  <Text style={styles.billMeta}>
    Account ending in {bill.accountNumberLast4}
  </Text>
) : null}

{bill.paymentAddress || bill.accountNumberLast4 || bill.notes ? (
  <View
    style={{
      alignSelf: "flex-start",
      backgroundColor: "#DDF7F1",
      borderColor: "#0F9F8E",
      borderWidth: 1,
      borderRadius: 999,
      paddingVertical: 4,
      paddingHorizontal: 10,
      marginTop: 6,
    }}
  >
    <Text
      style={{
        color: "#0F9F8E",
        fontWeight: "900",
        fontSize: 12,
      }}
    >
      Details saved
    </Text>
  </View>
) : null}
</View>

      <Text style={styles.billAmount}>{money(bill.amount)}</Text>
    </View>
  );
}

function SectionTitle({ title, subtitle, artwork, artworkLabel }) {
  return (
    <View style={styles.sectionTitle}>
      {artwork ? (
        <View style={styles.sectionHeadingRow}>
          <Text style={[styles.sectionHeading, styles.flexOne]}>{title}</Text>
          <View style={styles.sectionArtworkFrame}>
            <CharacterArtwork source={artwork} style={styles.sectionArtwork} resizeMode="contain" accessibilityLabel={artworkLabel} />
          </View>
        </View>
      ) : <Text style={styles.sectionHeading}>{title}</Text>}
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  currency = false,
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
}) {
  // Keep unfinished money text ("123." or "123.0") while saving its numeric value.
  // Converting the displayed value on each keystroke removes the decimal point.
  const [moneyDraft, setMoneyDraft] = useState(() => currency
    ? cleanNumber(value).toFixed(2) : String(value ?? ""));
  useEffect(() => {
    if (!currency) return;
    setMoneyDraft((draft) => cleanNumber(draft) === cleanNumber(value)
      ? draft : cleanNumber(value).toFixed(2));
  }, [currency, value]);

  function changeMoney(text) {
    if (!/^\d*(?:\.\d{0,2})?$/.test(text)) return;
    setMoneyDraft(text);
    onChangeText(text);
  }

  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          multiline && {
            minHeight: 100,
            textAlignVertical: "top",
            paddingTop: 18,
          },
        ]}
        value={currency ? moneyDraft : value}
        onChangeText={currency ? changeMoney : onChangeText}
        onBlur={currency ? () => setMoneyDraft(cleanNumber(moneyDraft).toFixed(2)) : undefined}
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor="#9AA3B2"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );
}

function EmptyCard({ text }) {
  return (
    <View style={styles.emptyCard}>
      <Ionicons name="sparkles" size={22} color={palette.purple} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  savingsArtworkFrame: { width: "100%", height: 180, overflow: "hidden" },
  savingsArtwork: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  foyerSafe: { flex: 1, backgroundColor: "#F8F3E8" },
  foyerArrivalImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  redDoorScene: { flex: 1, backgroundColor: "#244E3D", alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  doorSceneCopy: { position: "absolute", left: 20, right: 20, bottom: 24, alignItems: "center", backgroundColor: "rgba(16, 48, 36, 0.94)", borderRadius: 22, padding: 15 },
  foyerCloseButton: { position: "absolute", top: 18, right: 18, width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(0,0,0,0.22)", alignItems: "center", justifyContent: "center", zIndex: 5 },
  annieTrunk: { width: 270, height: 390, borderRadius: 135, backgroundColor: "#714A2A", alignItems: "center", justifyContent: "flex-end", paddingBottom: 24, overflow: "hidden", borderWidth: 8, borderColor: "#52331F", shadowColor: "#091D17", shadowOpacity: 0.34, shadowRadius: 22, shadowOffset: { width: 0, height: 12 } },
  trunkRingOne: { position: "absolute", width: 330, height: 90, borderRadius: 50, borderWidth: 8, borderColor: "rgba(245,205,139,0.18)", top: 58, transform: [{ rotate: "-14deg" }] },
  trunkRingTwo: { position: "absolute", width: 320, height: 80, borderRadius: 45, borderWidth: 7, borderColor: "rgba(54,29,14,0.19)", top: 170, transform: [{ rotate: "11deg" }] },
  redDoor: { width: 154, height: 238, borderTopLeftRadius: 77, borderTopRightRadius: 77, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, backgroundColor: "#C8463D", borderWidth: 7, borderColor: "#8E2C2A", alignItems: "center", justifyContent: "center", shadowColor: "#1F100A", shadowOpacity: 0.38, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  redDoorInset: { width: 105, height: 154, borderTopLeftRadius: 53, borderTopRightRadius: 53, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderWidth: 4, borderColor: "rgba(255,220,170,0.5)", alignItems: "center", justifyContent: "center" },
  redDoorNumber: { color: "#F7DCA7", fontSize: 26, fontWeight: "900", marginTop: 2 },
  doorKnob: { position: "absolute", right: 18, top: 131, width: 16, height: 16, borderRadius: 8, backgroundColor: "#F3C66B", borderWidth: 2, borderColor: "#A56A1F" },
  redDoorTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "900", marginTop: 24 },
  redDoorText: { color: "rgba(255,255,255,0.82)", fontSize: 15, lineHeight: 22, fontWeight: "700", textAlign: "center", marginTop: 7 },
  redDoorHint: { color: "#DFF7C8", fontSize: 12, fontWeight: "900", letterSpacing: 1, marginTop: 15 },
  foyerHome: { flex: 1, backgroundColor: "#F8F3E8" },
  foyerHomeContent: { padding: 18, paddingBottom: 42 },
  foyerHomeClose: { position: "absolute", top: 28, right: 28, zIndex: 8, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  foyerArch: { height: 280, borderTopLeftRadius: 145, borderTopRightRadius: 145, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden", backgroundColor: "#244E3D", justifyContent: "flex-end", padding: 22 },
  foyerArchImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  foyerArchShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(8, 30, 25, 0.26)" },
  foyerWelcome: { color: "#FFFFFF", fontSize: 35, fontWeight: "900", textShadowColor: "rgba(0,0,0,0.35)", textShadowRadius: 8 },
  foyerFamilyWall: { backgroundColor: "#FFFDF8", borderRadius: 28, padding: 18, marginTop: 16, borderWidth: 1, borderColor: "#EADFCB" },
  foyerWallEyebrow: { color: "#B25B4A", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  foyerWallTitle: { color: palette.ink, fontSize: 22, fontWeight: "900", marginTop: 3, marginBottom: 14 },
  foyerFrames: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  foyerFrame: { flexGrow: 1, minWidth: "44%", minHeight: 112, borderRadius: 18, backgroundColor: "#F4EBDD", borderWidth: 5, borderColor: "#D6B98B", alignItems: "center", justifyContent: "center", padding: 10 },
  foyerFrameLarge: { width: "100%", minHeight: 128, backgroundColor: "#F2ECFF", borderColor: "#BCAAEF" },
  foyerFrameTitle: { color: palette.ink, fontSize: 14, fontWeight: "900", textAlign: "center", marginTop: 6 },
  foyerFrameSub: { color: palette.muted, fontSize: 10, fontWeight: "700", textAlign: "center", marginTop: 4 },
  foyerMessageCard: { flexDirection: "row", gap: 12, backgroundColor: "#FFF4F6", borderRadius: 24, padding: 17, marginTop: 16, borderWidth: 1, borderColor: "#FFD4DC" },
  foyerMessageTitle: { color: palette.ink, fontSize: 16, lineHeight: 21, fontWeight: "900" },
  foyerMessageText: { color: palette.muted, fontSize: 12, lineHeight: 18, fontWeight: "700", marginTop: 5 },
  foyerEnterButton: { minHeight: 58, borderRadius: 20, backgroundColor: palette.purple, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 18 },
  foyerEnterButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  neighborhoodHero: {
    aspectRatio: 1672 / 941,
    marginHorizontal: -20,
    borderRadius: 20,
    marginTop: 4,
    marginBottom: 10,
    overflow: "hidden",
    backgroundColor: "#153F35",
    shadowColor: "#153557",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  heroArtwork: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  heroEdgeShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 18, 28, 0.02)",
  },
  heroHotspot: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  annieDoorHotspot: {
    left: "39.5%",
    top: "57%",
    width: "13%",
    height: "27%",
    minWidth: 48,
    minHeight: 48,
    borderWidth: 2,
    borderColor: "rgba(255, 220, 126, 0.85)",
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  postOfficeHotspot: {
    left: "20%",
    top: "23%",
    width: "17%",
    height: "23%",
  },
  budgetHotspot: {
    left: "3%",
    top: "35%",
    width: "19%",
    height: "22%",
  },
  debtHotspot: {
    right: "32%",
    top: "24%",
    width: "15%",
    height: "22%",
  },
  calmHotspot: {
    right: "1%",
    bottom: "22%",
    width: "19%",
    height: "22%",
  },
  heroCaptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  heroCaptionCopy: {
    flex: 1,
    paddingRight: 12,
  },
  heroCaptionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: palette.ink,
  },
  heroCaptionText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    color: "#547083",
    marginTop: 2,
  },
  gentleLimitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.mintBright,
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#087E70",
    shadowColor: "#153557",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  gentleLimitIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#087E70",
    marginRight: 13,
  },
  gentleLimitLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.25,
    color: palette.ink,
  },
  gentleLimitValue: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
    color: palette.ink,
    marginTop: 1,
  },
  gentleLimitSub: {
    fontSize: 11,
    fontWeight: "700",
    color: palette.ink,
    marginTop: 2,
  },
  neighborhoodPlacesCard: {
    backgroundColor: palette.teal,
    borderRadius: 28,
    padding: 17,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#087E70",
  },
  neighborhoodSectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  neighborhoodNavigationFrame: { width: "100%", aspectRatio: 3, marginBottom: 14 },
  neighborhoodNavigationArtwork: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  neighborhoodEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
    color: palette.ink,
  },
  neighborhoodSectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: palette.ink,
    marginTop: 2,
  },
  placeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  placeButton: {
    width: "47%",
    margin: "1.5%",
    minHeight: 104,
    borderRadius: 22,
    borderWidth: 1,
    padding: 12,
  },
  placeArtworkFrame: { width: "100%", aspectRatio: 1, marginBottom: 8 },
  placeArtwork: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  placeLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: palette.ink,
  },
  placeNote: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  dailyPosterCard: {
    borderRadius: 22,
    borderWidth: 2,
    padding: 16,
    marginBottom: 18,
    alignItems: "stretch",
    overflow: "hidden",
  },
  posterTape: {
    position: "absolute",
    width: 72,
    height: 19,
    backgroundColor: "rgba(255,255,255,0.68)",
    top: 2,
    left: "42%",
    transform: [{ rotate: "-3deg" }],
    zIndex: 5,
  },
  posterImageWrap: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginBottom: 16,
  },
  posterImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  posterCopy: {
    paddingVertical: 2,
    justifyContent: "center",
  },
  posterMascot: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  posterQuote: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
    color: palette.ink,
    marginTop: 4,
  },
  posterSub: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.muted,
    fontWeight: "700",
    marginTop: 6,
  },
  posterBrandPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  posterBrandText: {
    color: "white",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 4,
  },
  safe: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  flexOne: {
    flex: 1,
  },
  glowOne: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#D9FFF8",
    top: 40,
    left: -90,
    opacity: 0.75,
  },
  glowTwo: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#F5E8FF",
    top: 40,
    right: -100,
    opacity: 0.8,
  },
  glowThree: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#FFF1DB",
    top: 260,
    right: -70,
    opacity: 0.75,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
  },
  headerHelp: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  headerHelpText: { color: palette.purple, fontWeight: '800' },
  headerPlans: { minHeight: 48, paddingHorizontal: 10, marginLeft: 8, justifyContent: 'center', backgroundColor: '#FFE455', borderColor: '#BA8500' },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBrand: { flex: 1, minWidth: 0, marginRight: 8 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 5,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  tabContent: { paddingBottom: 24 },
  bankingManualNote: { color: palette.ink, marginBottom: 10 },
  safeHeroCard: {
    backgroundColor: "#097A73",
    borderRadius: 28,
    padding: 20,
    marginTop: 4,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  safeMapShortcut: { margin: 10, flexDirection: "row", alignItems: "stretch", overflow: "hidden",
    backgroundColor: "#097A73", borderColor: "#60CFCB" },
  safeMapAmount: { color: "#BDFBFF", fontSize: 29, fontWeight: "900" },
  safeMapCopy: { flex: 1, minWidth: 0, padding: 10, justifyContent: "center" },
  safeMapArtwork: { width: "39%", minHeight: 90, flexShrink: 0 },
  safeHeroGlowOne: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: palette.mintBright,
    opacity: 0.16,
    right: -80,
    top: -80,
  },
  safeHeroGlowTwo: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: palette.purple,
    opacity: 0.18,
    left: -55,
    bottom: -55,
  },
  safeHeroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  safeHeroLabel: {
    color: "#C4FCFF",
    fontSize: 16,
    fontWeight: "900",
  },
  safeHeroPill: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  safeHeroPillText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  safeHeroAmount: {
    color: "#BDFBFF",
    fontSize: 48,
    fontWeight: "900",
    marginTop: 4,
  },
  safeHeroSub: {
    color: "#C4FCFF",
    fontSize: 14,
    marginTop: 5,
    fontWeight: "700",
  },
  safeHeroImageFrame: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    borderRadius: 18,
    marginTop: 14,
    borderWidth: 2,
    borderColor: "#BDFBFF",
    overflow: "hidden",
  },
  safeHeroDogsImage: {
    width: "100%",
    height: "100%",
  },
  safeHeroImageBadge: {
    position: "absolute",
    left: 12,
    top: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.86)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
  },
  safeHeroImageBadgeText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },
  safeProgressTrack: {
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(7, 26, 58, 0.16)",
    overflow: "hidden",
    marginTop: 18,
  },
  safeProgressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: palette.gold,
  },
  safeMiniGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 18,
  },
  safeMiniCard: {
    width: "48%",
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    marginBottom: 10,
    shadowColor: "#071A3A",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  safeMiniLabel: {
    color: "white",
    fontSize: 12,
    fontWeight: "900",
  },
  safeMiniValue: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 5,
    letterSpacing: -0.3,
  },
  safeHeroFootnote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(7, 26, 58, 0.26)",
    borderRadius: 18,
    padding: 12,
    marginTop: 4,
  },
  moneyMoodCard: {
    backgroundColor: palette.card,
    borderRadius: 28,
    padding: 22,
    marginTop: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  moodEyebrow: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  moodTitle: {
    color: palette.ink,
    fontSize: 38,
    fontWeight: "900",
    marginTop: 8,
  },
  moodCopy: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    fontWeight: "700",
  },
  moodGraphicFrame: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#DFF5F1",
    borderWidth: 2,
    borderColor: "#CBE6DF",
    marginTop: 16,
  },
  moodGraphic: {
    width: "100%",
    height: 180,
  },
  tellMeButton: {
    alignSelf: "flex-start",
    backgroundColor: palette.navy,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 18,
    marginTop: 16,
  },
  tellMeButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900",
  },
  extraPaycheckCard: {
    marginTop: 16,
    backgroundColor: "#FFF4BC",
    borderRadius: 30,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FFD21F",
    overflow: "hidden",
    shadowColor: palette.coral,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  extraGlowOne: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: palette.coral,
    opacity: 0.18,
    right: -40,
    top: -55,
  },
  extraGlowTwo: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: palette.mintBright,
    opacity: 0.2,
    left: -50,
    bottom: -65,
  },
  extraTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  extraIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: palette.mintBright,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.75)",
  },
  extraEyebrow: {
    color: palette.teal,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  extraTitle: {
    color: palette.ink,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 2,
  },
  extraPill: {
    backgroundColor: palette.purple,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginLeft: 10,
  },
  extraPillText: {
    color: "white",
    fontSize: 11,
    fontWeight: "900",
  },
  extraSubtitle: {
    color: palette.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800",
    marginTop: 14,
  },
  extraPaycheckImageFrame: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.95)",
    backgroundColor: "white",
    marginTop: 16,
    marginBottom: 14,
    overflow: "hidden",
  },
  extraPaycheckDogsImage: {
    width: "100%",
    height: "100%",
    borderRadius: 19,
  },
  extraSplitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
  },
  extraSplitCard: {
    width: "48%",
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  extraSplitLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  extraSplitValue: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 4,
  },
  extraButton: {
    marginTop: 2,
    backgroundColor: palette.ink,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  extraButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900",
    marginRight: 6,
  },
  hero: {
    backgroundColor: palette.navy,
    borderRadius: 30,
    padding: 22,
    marginTop: 4,
    overflow: "hidden",
  },
  heroGlowOne: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: palette.teal,
    opacity: 0.18,
    right: -70,
    top: -60,
  },
  heroGlowTwo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: palette.purple,
    opacity: 0.18,
    left: -45,
    bottom: -40,
  },
  heroLabel: {
    color: "#A7F3D0",
    fontSize: 14,
    fontWeight: "900",
  },
  heroAmount: {
    color: palette.mintBright,
    fontSize: 48,
    fontWeight: "900",
    marginTop: 6,
  },
  heroSub: {
    color: "#D6E3F0",
    fontSize: 16,
    marginTop: 6,
    fontWeight: "800",
  },
  nextCheckText: {
    color: palette.gold,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 8,
    lineHeight: 26,
  },
  heroRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  miniStat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.11)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginRight: 10,
  },
  miniLabel: {
    color: "#D7E1EC",
    fontSize: 12,
    fontWeight: "900",
  },
  miniValue: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 5,
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: palette.purple,
    paddingVertical: 16,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  billActionImageFrame: {
    width: "100%",
    height: 168,
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.95)",
    backgroundColor: "#EAF8F7",
    shadowColor: "#071A3A",
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  addBillImageFrame: {
    height: undefined,
    aspectRatio: 4 / 3,
    borderColor: "#D8CCFF",
  },
  sampleBillsShortcut: {
    marginTop: 12, borderWidth: 2, overflow: "hidden",
    backgroundColor: "#65EBEF", borderColor: "#00AABF",
  },
  sampleBillsCopy: { padding: 12 },
  sampleBillsTitle: { color: "#071A3A", fontWeight: "900", fontSize: 18 },
  billActionImage: {
    width: "100%",
    height: "100%",
  },
  billActionImageBadge: {
    position: "absolute",
    left: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.90)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
  },
  billActionImageBadgeText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },
  primaryButtonTight: {
    marginTop: 10,
    backgroundColor: palette.purple,
    paddingVertical: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  panicButton: {
    marginTop: 12,
    backgroundColor: palette.coral,
    paddingVertical: 16,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  storyActionCard: {
    marginTop: 16,
    backgroundColor: palette.card,
    borderRadius: 28,
    padding: 14,
    borderWidth: 2,
    borderColor: "#D9D8FF",
    shadowColor: "#0B1530",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  manualModeShowcase: {
    backgroundColor: "#F5F1FF",
    borderColor: "#CEC7FF",
  },
  overwhelmedShowcase: {
    marginTop: 12,
    backgroundColor: "#FFF5F5",
    borderColor: "#FFC9C9",
  },
  storyActionBanner: {
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  storyActionBannerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 10,
  },
  storyActionCaption: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "800",
    marginTop: 12,
    marginHorizontal: 4,
  },
  storyActionImageFrame: {
    width: "100%",
    height: 190,
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 12,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.94)",
    backgroundColor: "#E9F4FF",
  },
  storyActionImage: {
    width: "100%",
    height: "100%",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 10,
  },
  prototypeCard: {
    marginTop: 12,
    backgroundColor: palette.lavender,
    borderWidth: 1,
    borderColor: "#DED7FF",
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  prototypeText: {
    flex: 1,
    marginLeft: 10,
    color: palette.ink,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  plaidPlanCard: {
    marginTop: 12,
    backgroundColor: palette.gold,
    borderWidth: 1.4,
    borderColor: "#D09A00",
    borderRadius: 22,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  plaidIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: palette.purple,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  plaidTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  plaidText: {
    color: palette.ink,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: 2,
  },
  plaidEyebrow: { color: "#30206F", fontSize: 12, fontWeight: "800", marginBottom: 5 },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 12,
  },
  sectionHeadingRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sectionArtworkFrame: { width: "30%", maxWidth: 78, aspectRatio: 1 },
  sectionArtwork: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  sectionHeading: {
    fontSize: 26,
    fontWeight: "900",
    color: palette.ink,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: palette.muted,
    marginTop: 4,
    lineHeight: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickCard: {
    width: "48.5%",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.4,
    marginBottom: 12,
  },
  quickArtworkFrame: { width: "100%", aspectRatio: 1, marginBottom: 14 },
  quickArtwork: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  quickLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "900",
  },
  quickValue: {
    color: palette.ink,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 4,
  },
  quickSub: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 3,
    fontWeight: "700",
  },
  billRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.gold,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D09A00",
    marginBottom: 10,
  },
  billDot: {
    width: 12,
    height: 12,
    borderRadius: 99,
    marginRight: 12,
  },
  billName: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  billMeta: {
    color: palette.ink,
    fontSize: 13,
    marginTop: 3,
    fontWeight: "700",
  },
  billAmount: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  nextActionCard: {
    marginTop: 8,
    backgroundColor: palette.teal,
    borderWidth: 1,
    borderColor: "#087E70",
    padding: 16,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
  },
  nextActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 16,
    backgroundColor: palette.gold,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  nextActionTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  nextActionText: {
    color: palette.ink,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: palette.ink,
    marginBottom: 12,
  },
  inputWrap: {
    marginBottom: 12,
  },
  inputLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
  },
  input: {
    backgroundColor: palette.bg,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: palette.ink,
    fontWeight: "800",
  },
  billCard: {
    backgroundColor: palette.card,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  smallButton: {
    flex: 1,
    minWidth: '44%',
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  smallButtonText: {
    color: "white",
    fontWeight: "900",
  },
  iconButton: {
    width: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  safeSpendCard: {
    backgroundColor: palette.teal,
    borderRadius: 28,
    padding: 22,
    marginBottom: 14,
  },
  cardLabelLight: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
  },
  safeSpendNumber: {
    color: "white",
    fontSize: 50,
    fontWeight: "900",
    marginTop: 4,
  },
  safeSpendSub: {
    color: "#EFFFFB",
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
    fontWeight: "700",
  },
  cardSub: {
    color: palette.muted,
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
    fontWeight: "700",
  },
  noteCard: {
    backgroundColor: palette.lavender,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DED7FF",
  },
  noteText: {
    flex: 1,
    color: palette.ink,
    lineHeight: 20,
    fontWeight: "700",
    marginLeft: 10,
  },
  resetButton: {
    marginTop: 14,
    backgroundColor: palette.blush,
    borderWidth: 1,
    borderColor: "#FFD1D1",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    color: palette.coralDark,
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },
  payoffToggleCard: {
    backgroundColor: palette.card,
    borderRadius: 28,
    padding: 12,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 16,
    shadowColor: "#7C5CFF",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  payoffToggleTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  payoffModeList: {
    gap: 12,
  },
  payoffModeButton: {
    width: "100%",
    borderRadius: 22,
    borderWidth: 2,
    overflow: "hidden",
  },
  payoffModeCaption: { padding: 12 },
  payoffModeButtonActive: {
    borderWidth: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  payoffModeTitle: {
    fontSize: 21,
    fontWeight: "900",
  },
  payoffModeSub: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
    fontWeight: "700",
  },
  recommendationCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 2,
    marginBottom: 14,
  },
  recommendationEyebrow: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  recommendationTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 5,
  },
  recommendationText: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    fontWeight: "700",
  },
  debtCard: {
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 14,
  },
  debtHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  debtRank: {
    fontSize: 12,
    fontWeight: "900",
  },
  debtName: {
    color: palette.ink,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 2,
  },
  targetBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  aprPill: {
    backgroundColor: palette.blush,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  aprText: {
    color: palette.coralDark,
    fontWeight: "900",
    fontSize: 12,
  },
  debtBalance: {
    color: palette.ink,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 14,
  },
  calmHero: {
    backgroundColor: palette.aqua,
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#B7F4EC",
    marginTop: 6,
  },
  calmTitle: {
    color: palette.ink,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 10,
  },
  calmSub: {
    color: palette.muted,
    fontSize: 14,
    marginTop: 5,
    fontWeight: "700",
  },
  storyHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  storyHeroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.mintDark,
  },
  storyEyebrow: {
    color: palette.mintDark,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  storyHeroTitle: {
    color: palette.ink,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 2,
  },
  storyCard: {
    backgroundColor: palette.card,
    borderRadius: 28,
    marginTop: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: palette.border,
  },
  storyHeading: { paddingHorizontal: 16, paddingVertical: 12 },
  storyCollectionTitle: {
    color: palette.mintDark,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  storyTitle: {
    color: palette.ink,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "900",
    marginTop: 5,
  },
  storyCountNote: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 14,
    paddingHorizontal: 20,
    fontWeight: "700",
  },
  pearlCard: {
    backgroundColor: palette.card,
    borderRadius: 28,
    padding: 24,
    marginTop: 18,
    borderWidth: 1,
    borderColor: palette.border,
  },
  pearlImageFrame: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#DFF5F1",
    borderWidth: 2,
    borderColor: "#CBE6DF",
    minHeight: 210,
    marginTop: 16,
  },
  pearlImage: {
    width: "100%",
    height: 230,
  },
  pearlTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "900",
  },
  pearlBody: {
    color: palette.muted,
    fontSize: 17,
    lineHeight: 27,
    marginTop: 12,
    fontWeight: "700",
  },
  ghostButton: {
    marginTop: 14,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ghostButtonText: {
    color: palette.purple,
    fontSize: 15,
    fontWeight: "900",
    marginRight: 8,
  },
  emptyCard: {
    backgroundColor: palette.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: "row",
    alignItems: "center",
  },
  emptyText: {
    flex: 1,
    color: palette.muted,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    marginLeft: 10,
  },
  overlayShell: {
    flex: 1,
    backgroundColor: "rgba(7, 18, 40, 0.58)",
    justifyContent: "center",
    padding: 22,
  },
  guidanceModalCard: {
    backgroundColor: "#FFFDF8",
    borderRadius: 30,
    padding: 22,
    borderWidth: 2,
    borderColor: "#CFC7FF",
  },
  guidanceIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: palette.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  guidanceEyebrow: {
    color: palette.teal,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  guidanceTitle: {
    color: palette.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    marginTop: 8,
  },
  guidanceBody: {
    color: palette.muted,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
    marginTop: 10,
  },
  guidanceStepList: {
    marginTop: 18,
    gap: 12,
  },
  guidanceStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  guidanceStepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.purple,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },
  guidanceStepDotText: {
    color: "white",
    fontSize: 13,
    fontWeight: "900",
  },
  guidanceStepText: {
    flex: 1,
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
  guidanceActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  secondaryActionButton: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: palette.purple,
    fontSize: 16,
    fontWeight: "900",
  },
  guidancePrimaryButton: {
    flex: 1,
    marginTop: 0,
  },
  debtBuddyKicker: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  methodCard: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 22,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  methodBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  methodBallBullet: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginTop: 4,
    marginRight: 11,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.95)",
  },
  methodBulletTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 2,
  },
  methodBulletText: {
    flex: 1,
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  methodTipCard: {
    backgroundColor: palette.card,
    borderRadius: 22,
    padding: 15,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  methodTipText: {
    flex: 1,
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "800",
    marginLeft: 10,
  },
  debtBuddyCard: {
    borderRadius: 30,
    padding: 18,
    borderWidth: 2,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#071A3A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  debtBuddyHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  debtBuddyBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  debtBuddyEmoji: {
    fontSize: 28,
  },
  debtBuddyTitle: {
    color: palette.ink,
    fontSize: 26,
    fontWeight: "900",
  },
  debtBuddyBody: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  snowballSceneWrap: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 22,
    padding: 16,
  },
  snowballBuddyImage: {
    width: "100%",
    height: 260,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#DCE8FF",
    backgroundColor: "white",
  },
  snowballBulletWrap: {
    marginTop: 16,
    gap: 12,
  },
  snowballBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  methodBallBullet: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginTop: 4,
    marginRight: 11,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.95)",
  },
  methodBulletText: {
    flex: 1,
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  avalancheSceneWrap: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.52)",
    borderRadius: 22,
    padding: 16,
  },
  avalancheWaveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  waveSnowball: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D7F6FF",
  },
  avalancheDogRow: {
    backgroundColor: "#FFFFFFCC",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D7F6FF",
  },
  avalancheDogText: {
    color: palette.avalancheDark,
    fontSize: 28,
    fontWeight: "900",
  },
  avalancheRunText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },
  navWrap: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 18,
    backgroundColor: palette.bg,
  },
  nav: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: palette.border,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 22,
  },
  navText: {
    fontSize: 11,
    color: palette.muted,
    marginTop: 3,
    fontWeight: "800",
  },
  onboardingLoading: { alignItems: "center", justifyContent: "center", gap: 14, backgroundColor: "#F6FBFF" },
  onboardingLoadingText: { fontSize: 16, fontWeight: "800", color: palette.ink },
  onboardingSafe: { flex: 1, backgroundColor: "#F6FBFF" },
  onboardingScroll: { padding: 20, paddingBottom: 40 },
  onboardingBrandRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  onboardingMiniLogo: { width: 44, height: 44, borderRadius: 16, backgroundColor: palette.purple, alignItems: "center", justifyContent: "center" },
  onboardingBrand: { fontSize: 26, fontWeight: "900", color: palette.ink },
  onboardingTagline: { color: palette.muted, fontWeight: "700", marginTop: -2 },
  onboardingProgressTrack: { height: 9, borderRadius: 999, backgroundColor: "#E2E8F0", overflow: "hidden" },
  onboardingProgressFill: { height: "100%", borderRadius: 999 },
  onboardingStepLabel: { marginTop: 8, marginBottom: 14, textAlign: "right", color: palette.muted, fontSize: 12, fontWeight: "800" },
  annieWelcomeScroll: { flexGrow: 1, minHeight: "100%", justifyContent: "flex-start", padding: 16, paddingTop: 16, backgroundColor: "#173D35" },
  annieWelcomeImage: { width: "100%", height: 170, marginBottom: 12 },
  annieWelcomeShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(9, 34, 28, 0.48)" },
  annieWelcomeCard: { backgroundColor: "rgba(255,255,255,0.96)", borderRadius: 30, padding: 22, shadowColor: "#000", shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  annieWelcomeEyebrow: { fontSize: 12, fontWeight: "900", letterSpacing: 1.6, color: "#3D7A62", marginBottom: 6 },
  annieWelcomeTitle: { fontSize: 34, fontWeight: "900", color: palette.ink, marginBottom: 10 },
  annieWelcomeBody: { fontSize: 17, lineHeight: 25, color: palette.muted, marginBottom: 18 },
  annieWelcomePrompt: { fontSize: 20, fontWeight: "800", color: palette.ink, marginBottom: 12 },
  annieWelcomeChoices: { gap: 10 },
  annieWelcomeChoice: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: "#D7E7DF", backgroundColor: "#F8FCFA", borderRadius: 16, paddingVertical: 13, paddingHorizontal: 14 },
  annieWelcomeChoiceSelected: { borderColor: palette.coral, backgroundColor: "#FFF2EF" },
  annieWelcomeChoiceText: { flex: 1, fontSize: 15, fontWeight: "700", color: palette.ink },
  annieWelcomeButton: { marginTop: 18, backgroundColor: "#3D7A62", borderRadius: 18, paddingVertical: 15, paddingHorizontal: 18, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
  annieWelcomeButtonDisabled: { backgroundColor: "#B9C8C1" },
  annieWelcomeButtonText: { color: "white", fontSize: 17, fontWeight: "900" },
  quiltGiftScroll: { flexGrow: 1, justifyContent: "center", padding: 22, backgroundColor: "#FFF8E8" },
  quiltGiftGlow: { position: "absolute", width: 280, height: 280, borderRadius: 140, backgroundColor: "#FFE7A8", opacity: 0.65, alignSelf: "center", top: 70 },
  quiltGiftCard: { backgroundColor: "white", borderRadius: 32, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#F0DCA9", shadowColor: "#7A5422", shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  quiltGiftEyebrow: { fontSize: 12, fontWeight: "900", letterSpacing: 1.8, color: "#8A6A32", marginBottom: 16 },
  quiltSquare: { width: 160, height: 160, backgroundColor: "#F6E2A8", borderRadius: 22, borderWidth: 8, borderColor: "#D56F62", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-2deg" }], marginBottom: 20 },
  quiltSquareLabel: { marginTop: 8, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, color: "#6B5128" },
  quiltGiftTitle: { fontSize: 28, lineHeight: 34, textAlign: "center", fontWeight: "900", color: palette.ink, marginBottom: 14 },
  quiltGiftDialogue: { fontSize: 17, lineHeight: 25, textAlign: "center", color: palette.muted, marginBottom: 12 },
  quiltGiftQuestion: { fontSize: 16, fontStyle: "italic", color: "#7C5F54", marginBottom: 8 },
  quiltGiftAnswer: { fontSize: 19, lineHeight: 28, textAlign: "center", fontWeight: "800", color: "#3D7A62", marginBottom: 18 },
  quiltNote: { width: "100%", backgroundColor: "#FFF9EC", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#EEDDAF", marginBottom: 14 },
  quiltNoteText: { fontSize: 21, fontWeight: "900", color: palette.ink, textAlign: "center" },
  quiltNoteSignature: { marginTop: 6, fontSize: 15, fontStyle: "italic", color: "#6B705C", textAlign: "center" },
  quiltGiftFooter: { fontSize: 14, lineHeight: 21, textAlign: "center", color: palette.muted, marginBottom: 18 },
  quiltGiftButton: { width: "100%", backgroundColor: palette.purple, borderRadius: 18, paddingVertical: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
  quiltGiftButtonText: { color: "white", fontSize: 17, fontWeight: "900" },
  onboardingCard: { backgroundColor: "white", borderRadius: 28, padding: 18, shadowColor: "#172554", shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 9 }, elevation: 5 },
  onboardingImage: { width: "100%", height: 210, borderRadius: 20, backgroundColor: palette.lavender },
  onboardingMascotBadge: { alignSelf: "flex-start", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, marginTop: -24, marginLeft: 12, borderWidth: 4, borderColor: "white" },
  onboardingMascotName: { color: "white", fontWeight: "900", fontSize: 15 },
  onboardingMascotRole: { color: "white", opacity: 0.9, fontWeight: "700", fontSize: 11 },
  onboardingQuestion: { fontSize: 27, lineHeight: 32, color: palette.ink, fontWeight: "900", marginTop: 18 },
  onboardingHelper: { fontSize: 15, lineHeight: 22, color: palette.muted, marginTop: 8, marginBottom: 16 },
  onboardingChoices: { gap: 10 },
  onboardingChoice: { minHeight: 54, paddingVertical: 12, borderWidth: 2, borderColor: palette.border, borderRadius: 16, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "white" },
  onboardingChoiceText: { flex: 1, color: palette.muted, fontSize: 15, fontWeight: "800" },
  onboardingInput: { minHeight: 56, borderWidth: 2, borderRadius: 16, paddingHorizontal: 16, fontSize: 17, color: palette.ink, backgroundColor: "#FBFDFF" },
  onboardingInputMultiline: { minHeight: 130, paddingTop: 14, textAlignVertical: "top" },
  onboardingButtons: { flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginTop: 18 },
  onboardingBackButton: { minHeight: 48, minWidth: 64, flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 14, paddingHorizontal: 8 },
  onboardingBackText: { color: palette.ink, fontWeight: "900" },
  onboardingNextButton: { minHeight: 54, flexShrink: 1, borderRadius: 18, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  onboardingNextText: { color: "white", fontSize: 16, fontWeight: "900" },
  firstLetterPreview: { marginTop: 18, padding: 16, borderRadius: 18, backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FED7AA", alignItems: "center" },
  firstLetterTitle: { marginTop: 6, fontSize: 16, fontWeight: "900", color: palette.ink },
  firstLetterText: { marginTop: 4, textAlign: "center", color: palette.muted, lineHeight: 20 },


  visitAnnieButton: {
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: "#7A5CE6",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  visitAnnieButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
  },

});
