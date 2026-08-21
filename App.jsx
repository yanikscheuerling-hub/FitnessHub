import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Camera, Lock, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, RefreshCw, Play, X, Loader2, Home, Utensils, Dumbbell, Footprints, Search, Trash2, Save } from "lucide-react";

const iso = (d) => d.toISOString().slice(0, 10);
const todayStr = () => iso(new Date());
const fmtDate = (d) => new Date(d).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
const addDays = (dateStr, n) => { const d = new Date(dateStr); d.setDate(d.getDate() + n); return iso(d); };
const daysAgo = (d) => Math.floor((new Date(todayStr()) - new Date(d)) / 86400000);
const dayOfYear = () => Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
const ytLink = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
function hashSeed(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) >>> 0; } return h; }
function seededShuffle(arr, seed) {
  const a = [...arr]; let s = seed;
  for (let i = a.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ================= KONSTANTEN =================
const ACTIVITY = { sedentary: { label: "Sitzend, kaum Bewegung", mult: 1.2 }, light: { label: "Leicht aktiv", mult: 1.375 }, moderate: { label: "Mäßig aktiv", mult: 1.55 }, active: { label: "Sehr aktiv", mult: 1.725 } };
const GOALS = { abnehmen: { label: "Gewicht verlieren", delta: -500 }, halten: { label: "Gewicht halten", delta: 0 }, muskelaufbau: { label: "Muskeln aufbauen", delta: 300 }, kraft: { label: "Stärker werden", delta: 200 } };
const FITNESS_LEVELS = { anfänger: "Anfänger", mittel: "Mittel", fortgeschritten: "Fortgeschritten" };
const RUN_GOALS = { marathon: "Marathon vorbereiten", halbmarathon: "Halbmarathon vorbereiten", schneller5: "Schneller 5km", schneller10: "Schneller 10km", ausdauer: "Allgemeine Ausdauer" };

// ================= NAHRUNGSMITTEL =================
const FOOD_DB = [
  { id: "f1", name: "Haferflocken", kcal: 389, protein: 17, carbs: 66, fat: 7, cat: "Frühstück", emoji: "🥣" },
  { id: "f2", name: "Ei (groß)", kcal: 78, protein: 6, carbs: 1, fat: 5, cat: "Frühstück", emoji: "🥚" },
  { id: "f3", name: "Vollkornbrot (Scheibe)", kcal: 90, protein: 4, carbs: 15, fat: 1, cat: "Frühstück", emoji: "🍞" },
  { id: "f4", name: "Magerquark (100g)", kcal: 71, protein: 13, carbs: 3, fat: 0, cat: "Frühstück", emoji: "🥛" },
  { id: "f5", name: "Griechischer Joghurt (150g)", kcal: 130, protein: 15, carbs: 6, fat: 5, cat: "Frühstück", emoji: "🍯" },
  { id: "f6", name: "Hähnchenbrust (100g)", kcal: 165, protein: 31, carbs: 0, fat: 4, cat: "Protein", emoji: "🍗" },
  { id: "f7", name: "Lachs (100g)", kcal: 208, protein: 20, carbs: 0, fat: 13, cat: "Protein", emoji: "🐟" },
  { id: "f8", name: "Rinderhack mager (100g)", kcal: 215, protein: 26, carbs: 0, fat: 12, cat: "Protein", emoji: "🥩" },
  { id: "f9", name: "Tofu (100g)", kcal: 76, protein: 8, carbs: 2, fat: 5, cat: "Protein", emoji: "🟫" },
  { id: "f10", name: "Thunfisch (Dose, 100g)", kcal: 116, protein: 26, carbs: 0, fat: 1, cat: "Protein", emoji: "🐟" },
  { id: "f11", name: "Reis, gekocht (100g)", kcal: 130, protein: 3, carbs: 28, fat: 0, cat: "Kohlenhydrate", emoji: "🍚" },
  { id: "f12", name: "Kartoffel (100g)", kcal: 77, protein: 2, carbs: 17, fat: 0, cat: "Kohlenhydrate", emoji: "🥔" },
  { id: "f13", name: "Vollkornpasta, gekocht (100g)", kcal: 158, protein: 6, carbs: 31, fat: 1, cat: "Kohlenhydrate", emoji: "🍝" },
  { id: "f14", name: "Süßkartoffel (100g)", kcal: 86, protein: 2, carbs: 20, fat: 0, cat: "Kohlenhydrate", emoji: "🍠" },
  { id: "f15", name: "Quinoa, gekocht (100g)", kcal: 120, protein: 4, carbs: 21, fat: 2, cat: "Kohlenhydrate", emoji: "🌾" },
  { id: "f16", name: "Brokkoli (100g)", kcal: 34, protein: 3, carbs: 7, fat: 0, cat: "Gemüse", emoji: "🥦" },
  { id: "f17", name: "Spinat (100g)", kcal: 23, protein: 3, carbs: 4, fat: 0, cat: "Gemüse", emoji: "🥬" },
  { id: "f18", name: "Paprika (100g)", kcal: 31, protein: 1, carbs: 6, fat: 0, cat: "Gemüse", emoji: "🫑" },
  { id: "f19", name: "Tomate (100g)", kcal: 18, protein: 1, carbs: 4, fat: 0, cat: "Gemüse", emoji: "🍅" },
  { id: "f20", name: "Salatmix (100g)", kcal: 15, protein: 1, carbs: 3, fat: 0, cat: "Gemüse", emoji: "🥗" },
  { id: "f21", name: "Apfel", kcal: 95, protein: 0, carbs: 25, fat: 0, cat: "Obst", emoji: "🍎" },
  { id: "f22", name: "Banane", kcal: 105, protein: 1, carbs: 27, fat: 0, cat: "Obst", emoji: "🍌" },
  { id: "f23", name: "Beeren (100g)", kcal: 57, protein: 1, carbs: 12, fat: 0, cat: "Obst", emoji: "🫐" },
  { id: "f24", name: "Orange", kcal: 62, protein: 1, carbs: 15, fat: 0, cat: "Obst", emoji: "🍊" },
  { id: "f25", name: "Mandeln (30g)", kcal: 174, protein: 6, carbs: 6, fat: 15, cat: "Snacks", emoji: "🥜" },
  { id: "f26", name: "Erdnussbutter (30g)", kcal: 188, protein: 7, carbs: 5, fat: 16, cat: "Snacks", emoji: "🥜" },
  { id: "f27", name: "Dunkle Schokolade (30g)", kcal: 170, protein: 2, carbs: 14, fat: 12, cat: "Snacks", emoji: "🍫" },
  { id: "f28", name: "Reiswaffeln (2 Stk)", kcal: 70, protein: 1, carbs: 15, fat: 0, cat: "Snacks", emoji: "🍘" },
  { id: "f29", name: "Avocado (halb)", kcal: 160, protein: 2, carbs: 9, fat: 15, cat: "Snacks", emoji: "🥑" },
  { id: "f30", name: "Olivenöl (1 EL)", kcal: 119, protein: 0, carbs: 0, fat: 14, cat: "Fette", emoji: "🫒" },
  { id: "f31", name: "Milch 1.5% (100ml)", kcal: 47, protein: 3, carbs: 5, fat: 2, cat: "Getränke", emoji: "🥛" },
  { id: "f32", name: "Proteinshake (1 Scoop)", kcal: 120, protein: 24, carbs: 3, fat: 1, cat: "Getränke", emoji: "🥤" },
  { id: "f33", name: "Käse Gouda (30g)", kcal: 113, protein: 8, carbs: 0, fat: 9, cat: "Protein", emoji: "🧀" },
  { id: "f34", name: "Linsen, gekocht (100g)", kcal: 116, protein: 9, carbs: 20, fat: 0, cat: "Protein", emoji: "🫘" },
  { id: "f35", name: "Kichererbsen, gekocht (100g)", kcal: 164, protein: 9, carbs: 27, fat: 3, cat: "Protein", emoji: "🫘" },
];
const foodById = (id) => FOOD_DB.find(f => f.id === id);

// Flache, durchsuchbare Rezeptdatenbank (Zutaten als Namen für Suche)
const RECIPES = [
  // Frühstück
  { id: "r1", name: "Magerquark-Beeren-Bowl", meal: "Frühstück", goals: ["abnehmen", "halten"], items: ["f4", "f23", "f1"] },
  { id: "r2", name: "Rührei mit Spinat", meal: "Frühstück", goals: ["abnehmen", "kraft"], items: ["f2", "f2", "f17"] },
  { id: "r3", name: "Porridge mit Proteinshake & Banane", meal: "Frühstück", goals: ["muskelaufbau"], items: ["f1", "f32", "f22"] },
  { id: "r4", name: "Bananen-Haferflocken-Pancakes", meal: "Frühstück", goals: ["muskelaufbau", "halten"], items: ["f22", "f1", "f2"] },
  { id: "r5", name: "Apfel-Zimt-Porridge", meal: "Frühstück", goals: ["abnehmen", "halten"], items: ["f1", "f21", "f31"] },
  { id: "r6", name: "Avocado-Brot mit Ei", meal: "Frühstück", goals: ["halten", "kraft"], items: ["f3", "f29", "f2"] },
  { id: "r7", name: "Joghurt mit Apfel & Mandeln", meal: "Frühstück", goals: ["halten", "abnehmen"], items: ["f5", "f21", "f25"] },
  { id: "r8", name: "4-Eier-Omelett mit Käse", meal: "Frühstück", goals: ["muskelaufbau", "kraft"], items: ["f2", "f2", "f2", "f33"] },
  { id: "r9", name: "Beeren-Proteinshake", meal: "Frühstück", goals: ["abnehmen", "muskelaufbau"], items: ["f32", "f23", "f31"] },
  { id: "r10", name: "Erdnussbutter-Bananen-Toast", meal: "Frühstück", goals: ["muskelaufbau", "halten"], items: ["f3", "f26", "f22"] },
  // Mittag
  { id: "r11", name: "Hähnchen-Gemüse-Pfanne", meal: "Mittag", goals: ["abnehmen", "kraft"], items: ["f6", "f16", "f18"] },
  { id: "r12", name: "Linsensalat mit Tomate", meal: "Mittag", goals: ["abnehmen", "halten"], items: ["f34", "f19", "f20"] },
  { id: "r13", name: "Reis-Rind-Bowl", meal: "Mittag", goals: ["muskelaufbau", "kraft"], items: ["f11", "f8", "f16"] },
  { id: "r14", name: "Quinoa-Lachs-Bowl mit Avocado", meal: "Mittag", goals: ["muskelaufbau", "halten"], items: ["f15", "f7", "f29"] },
  { id: "r15", name: "Kichererbsen-Curry", meal: "Mittag", goals: ["abnehmen", "halten"], items: ["f35", "f19", "f11"] },
  { id: "r16", name: "Thunfisch-Reis-Bowl", meal: "Mittag", goals: ["kraft", "muskelaufbau"], items: ["f10", "f11", "f30"] },
  { id: "r17", name: "Hähnchen-Quinoa-Bowl", meal: "Mittag", goals: ["halten", "abnehmen"], items: ["f6", "f15", "f18"] },
  { id: "r18", name: "Süßkartoffel-Tofu-Pfanne", meal: "Mittag", goals: ["abnehmen", "halten"], items: ["f14", "f9", "f16"] },
  { id: "r19", name: "Rind mit Kartoffeln & Brokkoli", meal: "Mittag", goals: ["kraft", "muskelaufbau"], items: ["f8", "f12", "f16"] },
  { id: "r20", name: "Pasta mit Hähnchen & Käse", meal: "Mittag", goals: ["muskelaufbau"], items: ["f13", "f6", "f33"] },
  // Abend
  { id: "r21", name: "Lachs mit Salat", meal: "Abend", goals: ["abnehmen", "halten"], items: ["f7", "f20", "f19"] },
  { id: "r22", name: "Tofu-Gemüsepfanne", meal: "Abend", goals: ["abnehmen"], items: ["f9", "f16", "f18"] },
  { id: "r23", name: "Steak mit Süßkartoffel", meal: "Abend", goals: ["muskelaufbau", "kraft"], items: ["f8", "f14", "f16"] },
  { id: "r24", name: "Gemüse-Pasta mit Olivenöl", meal: "Abend", goals: ["halten"], items: ["f13", "f19", "f30"] },
  { id: "r25", name: "Ofenlachs mit Kartoffeln", meal: "Abend", goals: ["kraft", "halten"], items: ["f7", "f12", "f17"] },
  { id: "r26", name: "Spinat-Linsen-Eintopf", meal: "Abend", goals: ["abnehmen", "halten"], items: ["f34", "f17", "f19"] },
  { id: "r27", name: "Hähnchen mit Reis & Paprika", meal: "Abend", goals: ["muskelaufbau", "kraft"], items: ["f6", "f11", "f18"] },
  { id: "r28", name: "Quark mit Beeren (leichtes Abendessen)", meal: "Abend", goals: ["abnehmen"], items: ["f4", "f23"] },
  { id: "r29", name: "Kichererbsen-Salat mit Feta-Alternative", meal: "Abend", goals: ["halten", "abnehmen"], items: ["f35", "f20", "f33"] },
  { id: "r30", name: "Pasta mit Thunfisch & Tomate", meal: "Abend", goals: ["muskelaufbau", "halten"], items: ["f13", "f10", "f19"] },
  // Snacks
  { id: "r31", name: "Apfel mit Erdnussbutter", meal: "Snack", goals: ["muskelaufbau", "halten"], items: ["f21", "f26"] },
  { id: "r32", name: "Joghurt mit Mandeln", meal: "Snack", goals: ["abnehmen", "halten"], items: ["f5", "f25"] },
  { id: "r33", name: "Banane mit Proteinshake", meal: "Snack", goals: ["muskelaufbau", "kraft"], items: ["f22", "f32"] },
  { id: "r34", name: "Reiswaffeln mit Avocado", meal: "Snack", goals: ["abnehmen", "halten"], items: ["f28", "f29"] },
];
function recipeIngredientNames(recipe) { return recipe.items.map(id => foodById(id)?.name || "").join(" "); }
function searchRecipes(query, mealFilter) {
  const q = query.trim().toLowerCase();
  return RECIPES.filter(r => {
    if (mealFilter && mealFilter !== "Alle" && r.meal !== mealFilter) return false;
    if (!q) return true;
    return r.name.toLowerCase().includes(q) || recipeIngredientNames(r).toLowerCase().includes(q);
  });
}
function recipeById(id) { return RECIPES.find(r => r.id === id); }
function recipeMacros(recipe) {
  return recipe.items.reduce((acc, id) => { const f = foodById(id); return { kcal: acc.kcal + f.kcal, protein: acc.protein + f.protein, carbs: acc.carbs + f.carbs, fat: acc.fat + f.fat }; }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}
function pickIndex(len, seed) { return len ? seed % len : 0; }

// ================= ÜBUNGEN =================
const EXERCISES = [
  // ===== BRUST =====
  { id: "e1", name: "Bankdrücken (Langhantel)", muscle: "Brust", equip: "Langhantel", region: "Oberkörper", seatTip: "Bank so, dass Stange über Augen hängt.", info: "Langhantel vom Brustbein hochdrücken, Ellbogen ca. 45°." },
  { id: "e2", name: "Schrägbankdrücken (Langhantel)", muscle: "Brust", equip: "Langhantel", region: "Oberkörper", info: "30° Neigung, trainiert obere Brust." },
  { id: "e3", name: "Bankdrücken (Kurzhantel)", muscle: "Brust", equip: "Kurzhantel", region: "Oberkörper", info: "Größerer Bewegungsradius als mit Langhantel." },
  { id: "e4", name: "Schrägbankdrücken (Kurzhantel)", muscle: "Brust", equip: "Kurzhantel", region: "Oberkörper", info: "Obere Brust, kontrolliert absenken." },
  { id: "e5", name: "Brustpresse (Maschine)", muscle: "Brust", equip: "Maschine", region: "Oberkörper", seatTip: "Griffe auf Brusthöhe einstellen.", info: "Sichere Variante zum Bankdrücken." },
  { id: "e6", name: "Butterfly (Maschine)", muscle: "Brust", equip: "Maschine", region: "Oberkörper", seatTip: "Griffe auf Brusthöhe.", info: "Arme vor der Brust zusammenführen." },
  { id: "e7", name: "Kabelzug-Fliegende", muscle: "Brust", equip: "Kabel", region: "Oberkörper", info: "Kabel von außen nach vorne zusammenführen." },
  { id: "e8", name: "Cable Crossover (tief)", muscle: "Brust", equip: "Kabel", region: "Oberkörper", info: "Von unten nach oben — obere Brust." },
  { id: "e9", name: "Dips (Brustversion)", muscle: "Brust", equip: "Körpergewicht", region: "Oberkörper", info: "Oberkörper vorgeneigt, untere Brust." },
  { id: "e10", name: "Liegestütze", muscle: "Brust", equip: "Körpergewicht", region: "Oberkörper", info: "Körper in gerader Linie, Ellbogen 45°." },
  { id: "e11", name: "Überzüge (Kurzhantel)", muscle: "Brust", equip: "Kurzhantel", region: "Oberkörper", info: "Dehnt Brust & Lat, quer auf der Bank." },
  // ===== RÜCKEN =====
  { id: "e12", name: "Klimmzug (breit)", muscle: "Rücken", equip: "Körpergewicht", region: "Oberkörper", info: "Hochziehen bis Kinn über Stange, breiter Griff." },
  { id: "e13", name: "Klimmzug (eng/Untergriff)", muscle: "Rücken", equip: "Körpergewicht", region: "Oberkörper", info: "Mehr Bizeps-Beteiligung." },
  { id: "e14", name: "Latzug breit (Kabel)", muscle: "Rücken", equip: "Kabel", region: "Oberkörper", seatTip: "Beinpolster fixiert Oberschenkel.", info: "Stange zur oberen Brust ziehen." },
  { id: "e15", name: "Latzug eng (Kabel)", muscle: "Rücken", equip: "Kabel", region: "Oberkörper", info: "Enger Griff, mehr unterer Lat." },
  { id: "e16", name: "Rudern sitzend (Kabel)", muscle: "Rücken", equip: "Kabel", region: "Oberkörper", seatTip: "Brustpolster passend einstellen.", info: "Griff zum Bauch, Rücken gerade." },
  { id: "e17", name: "Langhantelrudern", muscle: "Rücken", equip: "Langhantel", region: "Oberkörper", info: "Vorgebeugt, Stange zum Bauchnabel ziehen." },
  { id: "e18", name: "Kurzhantelrudern (einarmig)", muscle: "Rücken", equip: "Kurzhantel", region: "Oberkörper", info: "Ein Knie auf der Bank, Hantel zur Hüfte ziehen." },
  { id: "e19", name: "T-Bar Rudern", muscle: "Rücken", equip: "Maschine", region: "Oberkörper", seatTip: "Brustpolster auf untere Brust.", info: "Zum Bauch ziehen, Ellbogen nah am Körper." },
  { id: "e20", name: "Rudern (Maschine)", muscle: "Rücken", equip: "Maschine", region: "Oberkörper", info: "Geführte Bewegung, gut für Einsteiger." },
  { id: "e21", name: "Kreuzheben (Langhantel)", muscle: "Rücken", equip: "Langhantel", region: "Unterkörper", info: "Stange nah am Körper, aus der Hüfte heben." },
  { id: "e22", name: "Rumänisches Kreuzheben", muscle: "Rücken", equip: "Langhantel", region: "Unterkörper", info: "Beine fast gestreckt, Fokus Hüfte & Beinbizeps." },
  { id: "e23", name: "Hyperextension", muscle: "Rücken", equip: "Maschine", region: "Unterkörper", info: "Unterer Rücken, kontrolliert aufrichten." },
  { id: "e24", name: "Face Pulls (Kabel)", muscle: "Rücken", equip: "Kabel", region: "Oberkörper", info: "Seil zum Gesicht ziehen, hintere Schulter & oberer Rücken." },
  { id: "e25", name: "Überzüge (Kabel)", muscle: "Rücken", equip: "Kabel", region: "Oberkörper", info: "Arme fast gestreckt nach unten ziehen, isoliert den Lat." },
  // ===== BEINE =====
  { id: "e26", name: "Kniebeuge (Langhantel)", muscle: "Beine", equip: "Langhantel", region: "Unterkörper", info: "Oberschenkel bis mind. parallel absenken." },
  { id: "e27", name: "Frontkniebeuge", muscle: "Beine", equip: "Langhantel", region: "Unterkörper", info: "Stange vorne, mehr Quadrizeps." },
  { id: "e28", name: "Beinpresse", muscle: "Beine", equip: "Maschine", region: "Unterkörper", seatTip: "Knie 90°, Füße schulterbreit.", info: "Platte kontrolliert wegdrücken." },
  { id: "e29", name: "Hackenschmidt-Kniebeuge", muscle: "Beine", equip: "Maschine", region: "Unterkörper", info: "Geführte Kniebeuge, sehr quadrizepslastig." },
  { id: "e30", name: "Beinstrecker", muscle: "Beine", equip: "Maschine", region: "Unterkörper", seatTip: "Drehpunkt = Kniegelenk.", info: "Unterschenkel strecken, oben halten." },
  { id: "e31", name: "Beincurl liegend", muscle: "Beine", equip: "Maschine", region: "Unterkörper", seatTip: "Polster über der Ferse.", info: "Ferse Richtung Gesäß ziehen." },
  { id: "e32", name: "Beincurl sitzend", muscle: "Beine", equip: "Maschine", region: "Unterkörper", info: "Sitzende Variante, guter Stretch." },
  { id: "e33", name: "Ausfallschritte (Kurzhantel)", muscle: "Beine", equip: "Kurzhantel", region: "Unterkörper", info: "Großer Schritt, hinteres Knie absenken." },
  { id: "e34", name: "Bulgarian Split Squat", muscle: "Beine", equip: "Kurzhantel", region: "Unterkörper", info: "Hinterer Fuß erhöht, einbeinig absenken." },
  { id: "e35", name: "Hip Thrust", muscle: "Beine", equip: "Langhantel", region: "Unterkörper", info: "Hüfte kraftvoll nach oben drücken, Gesäß." },
  { id: "e36", name: "Wadenheben stehend", muscle: "Beine", equip: "Maschine", region: "Unterkörper", info: "Auf Zehenspitzen drücken, tief absenken." },
  { id: "e37", name: "Wadenheben sitzend", muscle: "Beine", equip: "Maschine", region: "Unterkörper", info: "Trifft den tieferen Wadenmuskel." },
  { id: "e38", name: "Hüftabduktion (Maschine)", muscle: "Beine", equip: "Maschine", region: "Unterkörper", info: "Beine nach außen drücken, Gesäßseite." },
  { id: "e39", name: "Hüftadduktion (Maschine)", muscle: "Beine", equip: "Maschine", region: "Unterkörper", info: "Beine nach innen führen, Adduktoren." },
  { id: "e40", name: "Goblet Squat", muscle: "Beine", equip: "Kurzhantel", region: "Unterkörper", info: "Hantel vor der Brust, gut für Einsteiger." },
  // ===== SCHULTERN =====
  { id: "e41", name: "Schulterdrücken (Langhantel)", muscle: "Schultern", equip: "Langhantel", region: "Oberkörper", info: "Stange von Schulterhöhe über den Kopf drücken." },
  { id: "e42", name: "Schulterdrücken (Kurzhantel)", muscle: "Schultern", equip: "Kurzhantel", region: "Oberkörper", info: "Kurzhanteln nach oben drücken." },
  { id: "e43", name: "Schulterpresse (Maschine)", muscle: "Schultern", equip: "Maschine", region: "Oberkörper", seatTip: "Griffe auf Schulterhöhe.", info: "Geführt nach oben drücken." },
  { id: "e44", name: "Seitheben (Kurzhantel)", muscle: "Schultern", equip: "Kurzhantel", region: "Oberkörper", info: "Seitlich bis Schulterhöhe, leicht gebeugte Arme." },
  { id: "e45", name: "Seitheben (Kabel)", muscle: "Schultern", equip: "Kabel", region: "Oberkörper", info: "Konstante Spannung über die ganze Bewegung." },
  { id: "e46", name: "Frontheben", muscle: "Schultern", equip: "Kurzhantel", region: "Oberkörper", info: "Vor dem Körper bis Schulterhöhe heben." },
  { id: "e47", name: "Reverse Butterfly (Maschine)", muscle: "Schultern", equip: "Maschine", region: "Oberkörper", info: "Arme nach hinten öffnen, hintere Schulter." },
  { id: "e48", name: "Reverse Flys (Kurzhantel)", muscle: "Schultern", equip: "Kurzhantel", region: "Oberkörper", info: "Vorgebeugt, Arme seitlich anheben." },
  { id: "e49", name: "Aufrechtes Rudern", muscle: "Schultern", equip: "Langhantel", region: "Oberkörper", info: "Stange eng am Körper zum Kinn ziehen." },
  { id: "e50", name: "Shrugs (Nackenheben)", muscle: "Schultern", equip: "Kurzhantel", region: "Oberkörper", info: "Schultern gerade nach oben ziehen, Trapez." },
  // ===== ARME =====
  { id: "e51", name: "Bizepscurl (Langhantel)", muscle: "Arme", equip: "Langhantel", region: "Oberkörper", info: "Ellbogen am Körper fixiert, hochcurlen." },
  { id: "e52", name: "Bizepscurl (Kurzhantel)", muscle: "Arme", equip: "Kurzhantel", region: "Oberkörper", info: "Wechselseitig oder gleichzeitig." },
  { id: "e53", name: "Hammercurl", muscle: "Arme", equip: "Kurzhantel", region: "Oberkörper", info: "Neutraler Griff, trifft auch den Unterarm." },
  { id: "e54", name: "Scottcurl (SZ-Stange)", muscle: "Arme", equip: "Langhantel", region: "Oberkörper", seatTip: "Achseln auf dem Polster.", info: "Isoliert den Bizeps stark." },
  { id: "e55", name: "Bizepscurl (Kabel)", muscle: "Arme", equip: "Kabel", region: "Oberkörper", info: "Durchgehende Spannung." },
  { id: "e56", name: "Konzentrationscurl", muscle: "Arme", equip: "Kurzhantel", region: "Oberkörper", info: "Sitzend, Ellbogen am Oberschenkel abgestützt." },
  { id: "e57", name: "Trizepsdrücken Seil (Kabel)", muscle: "Arme", equip: "Kabel", region: "Oberkörper", seatTip: "Rolle auf Kopfhöhe.", info: "Seil nach unten drücken und auseinanderziehen." },
  { id: "e58", name: "Trizepsdrücken Stange (Kabel)", muscle: "Arme", equip: "Kabel", region: "Oberkörper", info: "Ellbogen fixiert, nach unten strecken." },
  { id: "e59", name: "French Press (SZ-Stange)", muscle: "Arme", equip: "Langhantel", region: "Oberkörper", info: "Hinter den Kopf absenken, dann strecken." },
  { id: "e60", name: "Überkopf-Trizeps (Kurzhantel)", muscle: "Arme", equip: "Kurzhantel", region: "Oberkörper", info: "Hantel hinter den Kopf senken, langer Trizepskopf." },
  { id: "e61", name: "Dips (Trizepsversion)", muscle: "Arme", equip: "Körpergewicht", region: "Oberkörper", info: "Oberkörper aufrecht, Fokus Trizeps." },
  { id: "e62", name: "Enges Bankdrücken", muscle: "Arme", equip: "Langhantel", region: "Oberkörper", info: "Enger Griff, sehr trizepslastig." },
  { id: "e63", name: "Unterarmcurl", muscle: "Arme", equip: "Kurzhantel", region: "Oberkörper", info: "Handgelenke einrollen, Unterarme." },
  // ===== BAUCH/CORE =====
  { id: "e64", name: "Plank", muscle: "Bauch", equip: "Körpergewicht", region: "Unterkörper", info: "Körper in gerader Linie halten." },
  { id: "e65", name: "Seitlicher Plank", muscle: "Bauch", equip: "Körpergewicht", region: "Unterkörper", info: "Seitliche Bauchmuskeln." },
  { id: "e66", name: "Crunches", muscle: "Bauch", equip: "Körpergewicht", region: "Unterkörper", info: "Oberkörper Richtung Knie einrollen." },
  { id: "e67", name: "Beinheben (hängend)", muscle: "Bauch", equip: "Körpergewicht", region: "Unterkörper", info: "An der Stange hängend Beine anheben." },
  { id: "e68", name: "Beinheben (liegend)", muscle: "Bauch", equip: "Körpergewicht", region: "Unterkörper", info: "Unteren Rücken am Boden lassen." },
  { id: "e69", name: "Russian Twist", muscle: "Bauch", equip: "Kurzhantel", region: "Unterkörper", info: "Oberkörper seitlich rotieren." },
  { id: "e70", name: "Bauchpresse (Maschine)", muscle: "Bauch", equip: "Maschine", region: "Unterkörper", info: "Geführte Crunch-Bewegung mit Gewicht." },
  { id: "e71", name: "Kabel-Crunch", muscle: "Bauch", equip: "Kabel", region: "Unterkörper", info: "Kniend am Kabel, Oberkörper einrollen." },
  { id: "e72", name: "Mountain Climbers", muscle: "Bauch", equip: "Körpergewicht", region: "Unterkörper", info: "Im Liegestütz Knie abwechselnd zur Brust." },
];
const MUSCLE_LIST = ["Brust", "Rücken", "Beine", "Schultern", "Arme", "Bauch"];
const EQUIP_LIST = ["Alle", "Langhantel", "Kurzhantel", "Maschine", "Kabel", "Körpergewicht"];
const exById = (id) => EXERCISES.find(e => e.id === id);

// Verschiedene Trainings-Splits zur Auswahl
const SPLITS = [
  { id: "fullbody3", name: "Ganzkörper-Split", days_label: "3 Tage/Woche", desc: "Ideal für Einsteiger oder wenig Zeit — jede Muskelgruppe 3×/Woche.", recommendedFor: ["anfänger"],
    days: [{ title: "Ganzkörper A", groups: ["Brust", "Rücken", "Beine", "Bauch"] }, { title: "Ganzkörper B", groups: ["Schultern", "Arme", "Beine", "Bauch"] }, { title: "Ganzkörper C", groups: ["Brust", "Rücken", "Beine"] }] },
  { id: "ul4", name: "Oberkörper/Unterkörper-Split", days_label: "4 Tage/Woche", desc: "Guter Mittelweg — jede Region 2×/Woche trainiert.", recommendedFor: ["mittel"],
    days: [{ title: "Oberkörper A (Brust/Arme)", groups: ["Brust", "Arme"] }, { title: "Unterkörper A (Beine)", groups: ["Beine", "Bauch"] }, { title: "Oberkörper B (Rücken/Schultern)", groups: ["Rücken", "Schultern"] }, { title: "Unterkörper B (Beine)", groups: ["Beine", "Bauch"] }] },
  { id: "ppl3", name: "Push/Pull/Legs-Split", days_label: "3 Tage/Woche", desc: "Klassiker nach Bewegungsmustern — Drücken, Ziehen, Beine.", recommendedFor: ["mittel", "fortgeschritten"],
    days: [{ title: "Push (Brust/Schultern/Trizeps)", groups: ["Brust", "Schultern", "Arme"] }, { title: "Pull (Rücken/Bizeps)", groups: ["Rücken", "Arme"] }, { title: "Legs (Beine)", groups: ["Beine", "Bauch"] }] },
  { id: "bro5", name: "5er-Split", days_label: "5 Tage/Woche", desc: "Für Fortgeschrittene mit viel Zeit — eine Muskelgruppe pro Tag.", recommendedFor: ["fortgeschritten"],
    days: [{ title: "Brust", groups: ["Brust"] }, { title: "Rücken", groups: ["Rücken"] }, { title: "Beine", groups: ["Beine"] }, { title: "Schultern", groups: ["Schultern"] }, { title: "Arme & Bauch", groups: ["Arme", "Bauch"] }] },
  { id: "ul2", name: "Minimal-Split", days_label: "2 Tage/Woche", desc: "Wenn nur zwei Trainingstage pro Woche möglich sind.", recommendedFor: [],
    days: [{ title: "Oberkörper", groups: ["Brust", "Rücken", "Schultern", "Arme"] }, { title: "Unterkörper", groups: ["Beine", "Bauch"] }] },
];
function setsRepsFor(goalType) {
  if (goalType === "kraft") return { sets: 5, reps: "3-6", note: "Hohes Gewicht, lange Pausen (3-5 Min). Fokus auf maximale Kraft." };
  if (goalType === "muskelaufbau") return { sets: 4, reps: "8-12", note: "Mittleres Gewicht, nah am Muskelversagen. Pause 60-90 Sek." };
  return { sets: 3, reps: "15-20", note: "Leichteres Gewicht, kurze Pausen (30-45 Sek). Fokus Ausdauer der Muskulatur." };
}
function recommendedSplitId(level) {
  const found = SPLITS.find(s => s.recommendedFor.includes(level));
  return found ? found.id : "fullbody3";
}
const WEEKDAY_SCHEDULES = { 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5] };
function generatePlanFromSplit(splitId, goalType, level) {
  const split = SPLITS.find(s => s.id === splitId) || SPLITS[0];
  const sr = setsRepsFor(goalType);
  const seed = hashSeed(splitId + goalType + level);
  const weekdays = WEEKDAY_SCHEDULES[split.days.length] || WEEKDAY_SCHEDULES[3];
  const days = split.days.map((d, i) => {
    const pool = EXERCISES.filter(e => d.groups.includes(e.muscle));
    const shuffled = seededShuffle(pool, seed + i * 17);
    const count = Math.min(shuffled.length, d.groups.length === 1 ? 5 : 6);
    return { title: d.title, weekday: weekdays[i], exercises: shuffled.slice(0, count).map(e => ({ exId: e.id, sets: sr.sets, reps: sr.reps })) };
  });
  return { id: "suggested-" + Date.now(), name: split.name, daysLabel: split.days_label, type: "suggested", splitId, days };
}

// ================= CARDIO =================
const PACE_TARGETS = {
  marathon: { anfänger: "6:30", mittel: "5:30", fortgeschritten: "4:40", distance: "10-32 km" },
  halbmarathon: { anfänger: "6:15", mittel: "5:20", fortgeschritten: "4:30", distance: "8-18 km" },
  schneller5: { anfänger: "6:00", mittel: "5:15", fortgeschritten: "4:20", distance: "5 km" },
  schneller10: { anfänger: "6:15", mittel: "5:30", fortgeschritten: "4:40", distance: "10 km" },
  ausdauer: { anfänger: "6:30", mittel: "5:45", fortgeschritten: "5:00", distance: "5-10 km" },
};
const CARDIO_TIPS = {
  marathon: "Marathon-Vorbereitung: Der lange Lauf ist entscheidend — steigere ihn wöchentlich um max. 10%. Die meisten Kilometer bewusst langsam ('easy pace') laufen, nur vereinzelt zügig. Da ein Marathon hohe Ausdauer verlangt, ist das Volumen höher angesetzt als bei allgemeinem Training.",
  halbmarathon: "Halbmarathon-Vorbereitung: Kombiniere einen wöchentlichen langen Lauf (bis 16-18km) mit Tempoläufen nahe deinem Zielpace. Mehr Volumen als bei 5-10km-Zielen, aber weniger als bei einem vollen Marathon.",
  schneller5: "Für ein schnelleres 5km-Ziel: kombiniere kurze, schnelle Intervalle mit lockeren Erholungsläufen. Tempo schrittweise steigern, nicht abrupt.",
  schneller10: "Für 10km: Baue Tempoläufe nahe deinem Zieltempo ein, dazu einen wöchentlichen langen, langsamen Lauf für die Ausdauerbasis.",
  ausdauer: "Für allgemeine Ausdauer: Die meisten Läufe locker laufen (du solltest dich noch unterhalten können) — nur 1×/Woche etwas zügiger.",
};
function paceToSec(p) { const [m, s] = p.split(":").map(Number); return m * 60 + s; }
function secToPace(sec) { sec = Math.max(120, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${s.toString().padStart(2, "0")}`; }
const DIST_BY_LEVEL = { anfänger: { locker: 3, long: 5, kurz: 2 }, mittel: { locker: 5, long: 9, tempo: 6, kurz: 3 }, fortgeschritten: { locker: 8, long: 16, tempo: 9, kurz: 5 } };
function bumpLevel(level) { if (level === "anfänger") return "mittel"; if (level === "mittel") return "fortgeschritten"; return "fortgeschritten"; }
function sessionDetails(type, level, basePaceStr) {
  const base = paceToSec(basePaceStr); const d = DIST_BY_LEVEL[level] || DIST_BY_LEVEL.anfänger;
  if (type === "Locker") return { distance: d.locker, pace: secToPace(base + 60) };
  if (type === "Long Run") return { distance: d.long, pace: secToPace(base + 45) };
  if (type === "Tempolauf") return { distance: d.tempo || d.locker, pace: secToPace(base + 10) };
  if (type === "Intervalle") return { distance: d.kurz || d.locker, pace: secToPace(base - 20) };
  return { distance: d.locker, pace: secToPace(base) };
}
const RUN_SESSIONS = {
  anfänger: { perWeek: 3, days: [0, 2, 4], sessionTypes: ["Locker", "Locker", "Long Run"] },
  mittel: { perWeek: 4, days: [0, 2, 4, 6], sessionTypes: ["Locker", "Intervalle", "Locker", "Long Run"] },
  fortgeschritten: { perWeek: 5, days: [0, 1, 3, 4, 6], sessionTypes: ["Locker", "Tempolauf", "Locker", "Intervalle", "Long Run"] },
};
function generateSuggestedCardioPlan(runGoal, level, nameOverride, adjustSec = 0, distFactor = 1) {
  const base = RUN_SESSIONS[level] || RUN_SESSIONS.anfänger;
  const basePace = paceToSec(PACE_TARGETS[runGoal]?.[level] || "6:00") + adjustSec;
  const pace = secToPace(basePace);
  const sessions = base.sessionTypes.map(type => {
    const det = sessionDetails(type, level, pace);
    const dist = Math.round(det.distance * distFactor * 10) / 10;
    return { title: type, desc: `${dist} km bei ca. ${det.pace} min/km`, distance: dist, pace: det.pace };
  });
  return { id: "cardio-suggested-" + Date.now(), name: nameOverride || `Vorschlag: ${RUN_GOALS[runGoal]}`, type: "suggested", planTypeId: null, perWeek: base.perWeek, targetPace: pace, distance: PACE_TARGETS[runGoal]?.distance || "5 km", tip: CARDIO_TIPS[runGoal], adjustSec, distFactor, createdAt: Date.now(),
    schedule: base.days.map((wd, i) => ({ weekday: wd, ...sessions[i] })) };
}
// Auswählbare Trainingsplan-Typen (analog zu den Kraft-Splits)
const CARDIO_PLAN_TYPES = [
  { id: "leicht", name: "Trainingsplan Leicht", desc: "Entspanntes Einsteiger-Tempo, wenig Volumen.", goal: "ausdauer", levelFn: () => "anfänger" },
  { id: "mittel", name: "Trainingsplan Mittel", desc: "Für regelmäßige Läufer mit etwas Erfahrung.", goal: "ausdauer", levelFn: () => "mittel" },
  { id: "schwer", name: "Trainingsplan Schwer", desc: "Hohes Volumen für erfahrene Läufer.", goal: "ausdauer", levelFn: () => "fortgeschritten" },
  { id: "schnelligkeit", name: "Trainingsplan Schnelligkeit", desc: "Fokus auf Tempo & Intervalle für ein schnelleres 5km-Tempo.", goal: "schneller5", levelFn: (lvl) => lvl },
  { id: "ausdauer", name: "Trainingsplan Ausdauer", desc: "Fokus auf lange, lockere Läufe zur Grundlagenausdauer.", goal: "ausdauer", levelFn: (lvl) => lvl },
  { id: "marathon", name: "Trainingsplan Marathon", desc: "Baut dich Richtung 42km auf — höheres Volumen, da ein Marathon mehr Grundlage braucht.", goal: "marathon", levelFn: (lvl) => bumpLevel(lvl) },
  { id: "halbmarathon", name: "Trainingsplan Halbmarathon", desc: "Baut dich Richtung 21km auf — mehr Volumen als ein Standardplan.", goal: "halbmarathon", levelFn: (lvl) => bumpLevel(lvl) },
];
function generateCardioPlanByType(planTypeId, profile, adjustSec = 0, distFactor = 1) {
  const type = CARDIO_PLAN_TYPES.find(t => t.id === planTypeId) || CARDIO_PLAN_TYPES[1];
  const level = type.levelFn(profile.fitnessLevel);
  const plan = generateSuggestedCardioPlan(type.goal, level, type.name, adjustSec, distFactor);
  plan.planTypeId = type.id;
  return plan;
}
function isoWeekKey(d) { const date = new Date(d); const onejan = new Date(date.getFullYear(), 0, 1); const week = Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7); return `${date.getFullYear()}-W${week}`; }
// Sofortige Anpassung: jedes einzelne Feedback verändert Tempo & Distanz direkt
const FEEDBACK_STEP = { "zu leicht": { pace: -10, dist: 0.1 }, "passend": { pace: 0, dist: 0 }, "zu anstrengend": { pace: 12, dist: -0.08 } };
function applyFeedbackToPlan(plan, feedback, profile) {
  const step = FEEDBACK_STEP[feedback];
  if (!step || !plan.planTypeId) return null;
  const newAdjustSec = Math.max(-60, Math.min(60, (plan.adjustSec || 0) + step.pace));
  const newDistFactor = Math.max(0.7, Math.min(1.6, (plan.distFactor || 1) + step.dist));
  const updated = generateCardioPlanByType(plan.planTypeId, profile, newAdjustSec, newDistFactor);
  updated.id = plan.id; updated.createdAt = plan.createdAt; updated.adaptCount = (plan.adaptCount || 0) + 1;
  return updated;
}
function nextDaysPreview(plan) {
  const today = new Date(); const todayWd = (today.getDay() + 6) % 7; // Mo=0
  const out = [];
  for (let i = 0; i < 7; i++) {
    const wd = (todayWd + i) % 7;
    const date = addDays(todayStr(), i);
    const session = plan.schedule.find(s => s.weekday === wd);
    out.push({ date, weekday: WEEKDAYS[wd], session });
  }
  return out;
}

function waterGoalMl(weight) { return Math.max(2000, Math.round(Number(weight || 70) * 33)); }
function calcTargets(p) {
  if (!p) return null;
  const w = Number(p.weight), h = Number(p.heightCm), a = Number(p.age);
  const bmr = p.gender === "weiblich" ? 10*w + 6.25*h - 5*a - 161 : 10*w + 6.25*h - 5*a + 5;
  const tdee = bmr * ACTIVITY[p.activity].mult;
  const calGoal = Math.max(1200, tdee + (GOALS[p.goalType]?.delta || 0));
  const proteinG = Math.round(w * (p.goalType === "kraft" || p.goalType === "muskelaufbau" ? 2.0 : 1.6));
  const fatG = Math.round((calGoal * 0.27) / 9);
  const carbsG = Math.max(0, Math.round((calGoal - proteinG*4 - fatG*9) / 4));
  return { calGoal: Math.round(calGoal), proteinG, fatG, carbsG };
}

// Barcode-Suche über Open Food Facts (kostenlose offene Datenbank)
async function lookupBarcode(code) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`);
    const j = await res.json();
    if (j.status !== 1 || !j.product) return { notfound: true };
    const p = j.product, n = p.nutriments || {};
    const per100 = {
      name: [p.brands, p.product_name].filter(Boolean).join(" ").trim() || "Produkt",
      kcal: Math.round(n["energy-kcal_100g"] ?? (n.energy_100g ? n.energy_100g / 4.184 : 0)),
      protein: Math.round(n.proteins_100g || 0),
      carbs: Math.round(n.carbohydrates_100g || 0),
      fat: Math.round(n.fat_100g || 0),
      fiber: Math.round(n.fiber_100g || 0),
    };
    if (!per100.kcal) return { notfound: true };
    const servingG = parseFloat(p.serving_quantity) || null;
    return { per100, servingG, image: p.image_front_small_url || null };
  } catch { return { failed: true }; }
}

// Barcode per Kamera lesen (nur Browser mit BarcodeDetector, z.B. Chrome/Android)
const barcodeSupported = () => typeof window !== "undefined" && "BarcodeDetector" in window;
async function detectBarcodeFromFile(file) {
  if (!barcodeSupported()) return null;
  try {
    const det = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"] });
    const bmp = await createImageBitmap(file);
    const codes = await det.detect(bmp);
    return codes?.[0]?.rawValue || null;
  } catch { return null; }
}

// Speicher: nutzt window.storage (in Claude) oder localStorage (gehostet)
// Daten werden pro Nutzerkonto getrennt gespeichert
let CURRENT_USER_ID = null;
const setStorageUser = (id) => { CURRENT_USER_ID = id; };
const scoped = (key) => CURRENT_USER_ID ? `fitapp:u:${CURRENT_USER_ID}:${key}` : `fitapp:${key}`;

async function loadKey(key, fallback) {
  try {
    if (typeof window !== "undefined" && window.storage?.get) {
      const res = await window.storage.get(scoped(key), false);
      return res ? JSON.parse(res.value) : fallback;
    }
    const v = window.localStorage.getItem(scoped(key));
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
async function saveKey(key, value) {
  try {
    if (typeof window !== "undefined" && window.storage?.set) {
      await window.storage.set(scoped(key), JSON.stringify(value), false);
      return;
    }
    window.localStorage.setItem(scoped(key), JSON.stringify(value));
  } catch (e) { console.error("Speichern fehlgeschlagen:", e); }
}
// Globale Keys (nicht nutzergebunden) — für Kontoverwaltung
async function loadGlobal(key, fallback) {
  try {
    if (typeof window !== "undefined" && window.storage?.get) {
      const res = await window.storage.get(`fitapp:global:${key}`, false);
      return res ? JSON.parse(res.value) : fallback;
    }
    const v = window.localStorage.getItem(`fitapp:global:${key}`);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
async function saveGlobal(key, value) {
  try {
    if (typeof window !== "undefined" && window.storage?.set) {
      await window.storage.set(`fitapp:global:${key}`, JSON.stringify(value), false);
      return;
    }
    window.localStorage.setItem(`fitapp:global:${key}`, JSON.stringify(value));
  } catch (e) { console.error(e); }
}
// Einfaches Hashing (kein echtes Sicherheitsverfahren — nur damit das Passwort nicht im Klartext liegt)
async function hashPassword(pw) {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("fitapp-salt::" + pw));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch {
    let h = 0; for (let i = 0; i < pw.length; i++) h = (h * 31 + pw.charCodeAt(i)) >>> 0;
    return "fallback" + h;
  }
}

// ================= UI HELFER =================
function Card({ children, style = {} }) { return <div style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 14, padding: 16, ...style }}>{children}</div>; }
function PrimaryBtn({ children, onClick, style = {}, disabled }) { return <button onClick={onClick} disabled={disabled} style={{ background: "#F5C518", color: "#111", fontWeight: 700, border: "none", borderRadius: 10, padding: "12px", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }}>{children}</button>; }
function Muted({ children, style = {} }) { return <span style={{ color: "#8A8A8A", fontSize: 12, ...style }}>{children}</span>; }
function ProLock({ size = 12 }) { return <Lock size={size} color="#F5C518" style={{ display: "inline", marginLeft: 4, verticalAlign: "middle" }} />; }
function SectionHeading({ children }) { return <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "4px 0 12px" }}>{children}</h2>; }
const inputStyle = { width: "100%", marginTop: 4, background: "#0D0D0D", border: "1px solid #2A2A2A", borderRadius: 8, padding: 9, color: "#fff", fontSize: 13 };
const smallBtn = { background: "#F5C518", color: "#111", border: "none", borderRadius: 6, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", width: "100%" };
const iconBtn = { background: "#0D0D0D", border: "1px solid #2A2A2A", borderRadius: 8, width: 32, height: 32, cursor: "pointer" };

function MuscleDiagram({ muscle, size = 54 }) {
  const regions = { Brust: { cx: 50, cy: 34, rx: 16, ry: 10 }, Rücken: { cx: 50, cy: 34, rx: 16, ry: 10 }, Schultern: { cx: 50, cy: 24, rx: 20, ry: 6 }, Arme: { cx: 26, cy: 40, rx: 6, ry: 14 }, Beine: { cx: 50, cy: 72, rx: 12, ry: 24 }, Bauch: { cx: 50, cy: 46, rx: 10, ry: 10 } };
  const r = regions[muscle] || regions.Brust;
  return (
    <svg viewBox="0 0 100 110" width={size} height={size * 1.1} style={{ flexShrink: 0 }}>
      <circle cx="50" cy="10" r="8" fill="none" stroke="#555" strokeWidth="2" />
      <path d="M35 20 L65 20 L70 55 L60 100 L52 100 L50 60 L48 100 L40 100 L30 55 Z" fill="none" stroke="#555" strokeWidth="2" />
      <ellipse cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} fill="#F5C518" opacity="0.75" />
    </svg>
  );
}
function MacroPie({ protein, carbs, fat }) {
  const data = [{ name: "P", value: protein || 0.01, fill: "#F5C518" }, { name: "C", value: carbs || 0.01, fill: "#FFFFFF" }, { name: "F", value: fat || 0.01, fill: "#555555" }];
  return <ResponsiveContainer width={100} height={100}><PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={26} outerRadius={44} dataKey="value">{data.map((e, i) => <Cell key={i} fill={e.fill} stroke="#1A1A1A" />)}</Pie></PieChart></ResponsiveContainer>;
}

// ================= EXERCISE PICKER MODAL =================
function adjustStrengthDay(plan, weekday, rating) {
  const dayIdx = plan.days.findIndex(d => d.weekday === weekday);
  if (dayIdx === -1) return null;
  const day = plan.days[dayIdx];
  const changes = [];
  const newExercises = day.exercises.map(ex => {
    if (rating === "zu leicht") return { ...ex, sets: Math.min(6, Number(ex.sets) + 1), targetIncrease: (ex.targetIncrease || 0) + 2.5 };
    if (rating === "zu schwer") return { ...ex, sets: Math.max(2, Number(ex.sets) - 1), targetIncrease: (ex.targetIncrease || 0) - 2.5 };
    return ex;
  });
  if (rating === "zu leicht") changes.push("1 Satz mehr pro Übung", "Zielgewicht +2,5 kg");
  if (rating === "zu schwer") changes.push("1 Satz weniger pro Übung", "Zielgewicht −2,5 kg");
  if (!changes.length) return null;
  return { updated: { ...plan, days: plan.days.map((d, i) => i !== dayIdx ? d : { ...d, exercises: newExercises }) }, changes };
}

function ExercisePicker({ onClose, onSelect }) {
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("Alle");
  const [equip, setEquip] = useState("Alle");
  const filtered = EXERCISES.filter(e => {
    if (muscle !== "Alle" && e.muscle !== muscle) return false;
    if (equip !== "Alle" && e.equip !== equip) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1100, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1A1A1A", width: "100%", maxHeight: "82vh", borderRadius: "18px 18px 0 0", padding: 16, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ color: "#fff", fontWeight: 700 }}>Übungs-Datenbank ({EXERCISES.length})</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color="#888" /></button>
        </div>
        <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Übung suchen..." style={{ ...inputStyle, marginTop: 0 }} />
        <Muted style={{ marginTop: 10, fontSize: 10 }}>Muskelgruppe</Muted>
        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
          {["Alle", ...MUSCLE_LIST].map(m => (
            <button key={m} onClick={() => setMuscle(m)} style={{ padding: "5px 9px", fontSize: 11, borderRadius: 6, cursor: "pointer", background: muscle === m ? "#F5C518" : "#161616", color: muscle === m ? "#111" : "#aaa", border: "1px solid #2A2A2A" }}>{m}</button>
          ))}
        </div>
        <Muted style={{ marginTop: 10, fontSize: 10 }}>Gerät</Muted>
        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
          {EQUIP_LIST.map(eq => (
            <button key={eq} onClick={() => setEquip(eq)} style={{ padding: "5px 9px", fontSize: 11, borderRadius: 6, cursor: "pointer", background: equip === eq ? "#F5C518" : "#161616", color: equip === eq ? "#111" : "#aaa", border: "1px solid #2A2A2A" }}>{eq}</button>
          ))}
        </div>
        <div style={{ overflow: "auto", marginTop: 10, flex: 1 }}>
          {filtered.length === 0 && <p style={{ fontSize: 12, color: "#666", padding: 10 }}>Keine Übung gefunden.</p>}
          {filtered.map(ex => (
            <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderBottom: "1px solid #2A2A2A" }}>
              <MuscleDiagram muscle={ex.muscle} size={32} />
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fff", fontSize: 13 }}>{ex.name}</p>
                <p style={{ color: "#888", fontSize: 10 }}>{ex.muscle} · {ex.equip}</p>
              </div>
              <a href={ytLink(ex.name + " Anleitung")} target="_blank" rel="noopener noreferrer" style={{ border: "1px solid #2A2A2A", borderRadius: 6, padding: 5, display: "flex" }}><Play size={12} color="#F5C518" /></a>
              <button onClick={() => onSelect(ex)} style={{ background: "#F5C518", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", display: "flex" }}><Plus size={14} color="#111" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================= ONBOARDING =================
function OptionBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", width: "100%", padding: 12, marginBottom: 8, borderRadius: 10, cursor: "pointer", textAlign: "left", background: active ? "rgba(245,197,24,0.15)" : "#161616", border: `1px solid ${active ? "#F5C518" : "#2A2A2A"}`, color: "#fff" }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${active ? "#F5C518" : "#555"}`, marginRight: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F5C518" }} />}</div>
      <span style={{ flex: 1 }}>{children}</span>
    </button>
  );
}

function Onboarding({ onComplete, userName }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ gender: "männlich", age: 28, heightCm: 178, weight: 78, goalWeight: 72, goalType: "muskelaufbau", activity: "moderate", fitnessLevel: "anfänger", runGoal: "ausdauer", agb: false });
  const set = (k, v) => setD(s => ({ ...s, [k]: v }));
  const steps = 6;
  const next = () => step < steps ? setStep(step + 1) : onComplete(d);
  return (
    <div style={{ minHeight: "100vh", height: "100vh", background: "#0D0D0D", padding: "20px 16px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ height: 4, background: "#2A2A2A", borderRadius: 2, marginBottom: 14, overflow: "hidden", flexShrink: 0 }}><div style={{ height: "100%", background: "#F5C518", width: `${(step / steps) * 100}%`, transition: "width .3s" }} /></div>
        <Card style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, padding: 18 }}>
          <Muted style={{ color: "#F5C518", flexShrink: 0 }}>SCHRITT {step + 1}/{steps + 1}</Muted>
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
           <div style={{ margin: "auto 0", width: "100%" }}>
          {step === 0 && (<><h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "12px 0" }}>Willkommen{userName ? `, ${userName}` : ""}! 💪</h1><p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.6 }}>Erstelle dein Profil für individuelle Trainings- und Ernährungspläne.</p></>)}
          {step === 1 && (<>
            <h2 style={{ color: "#fff", fontSize: 20, margin: "12px 0" }}>Körperdaten</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <label style={{ fontSize: 12, color: "#fff" }}>Geschlecht<select value={d.gender} onChange={e => set("gender", e.target.value)} style={inputStyle}><option value="männlich">Männlich</option><option value="weiblich">Weiblich</option></select></label>
              <label style={{ fontSize: 12, color: "#fff" }}>Alter<input type="number" value={d.age} onChange={e => set("age", e.target.value)} style={inputStyle} /></label>
              <label style={{ fontSize: 12, color: "#fff" }}>Größe (cm)<input type="number" value={d.heightCm} onChange={e => set("heightCm", e.target.value)} style={inputStyle} /></label>
              <label style={{ fontSize: 12, color: "#fff" }}>Gewicht (kg)<input type="number" value={d.weight} onChange={e => set("weight", e.target.value)} style={inputStyle} /></label>
              <label style={{ fontSize: 12, color: "#fff" }}>Zielgewicht (kg)<input type="number" value={d.goalWeight} onChange={e => set("goalWeight", e.target.value)} style={inputStyle} /></label>
            </div>
          </>)}
          {step === 2 && (<><h2 style={{ color: "#fff", fontSize: 20, margin: "12px 0" }}>Dein Ziel</h2>{Object.entries(GOALS).map(([k, v]) => <OptionBtn key={k} active={d.goalType === k} onClick={() => set("goalType", k)}>{v.label}</OptionBtn>)}</>)}
          {step === 3 && (<>
            <h2 style={{ color: "#fff", fontSize: 20, margin: "12px 0" }}>Wie fit bist du?</h2>
            <Muted>Kraft & Ausdauer</Muted>
            <div style={{ marginTop: 10 }}>{Object.entries(FITNESS_LEVELS).map(([k, v]) => <OptionBtn key={k} active={d.fitnessLevel === k} onClick={() => set("fitnessLevel", k)}>{v}</OptionBtn>)}</div>
            <h3 style={{ color: "#fff", fontSize: 14, margin: "16px 0 8px" }}>Arbeitest du auf ein Lauf-Ziel hin? (z. B. Marathon)</h3>
            {Object.entries(RUN_GOALS).map(([k, v]) => <OptionBtn key={k} active={d.runGoal === k} onClick={() => set("runGoal", k)}>{v}</OptionBtn>)}
          </>)}
          {step === 4 && (<><h2 style={{ color: "#fff", fontSize: 20, margin: "12px 0" }}>Aktivitätslevel im Alltag</h2>{Object.entries(ACTIVITY).map(([k, v]) => <OptionBtn key={k} active={d.activity === k} onClick={() => set("activity", k)}>{v.label}</OptionBtn>)}</>)}
          {step === 5 && (<><h2 style={{ color: "#fff", fontSize: 20, margin: "12px 0" }}>Fast geschafft</h2><Muted>Dein Kalorienziel wird berechnet.</Muted><div style={{ marginTop: 16, padding: 12, background: "rgba(245,197,24,0.1)", borderRadius: 8 }}><p style={{ color: "#F5C518", fontSize: 24, fontWeight: 800 }}>{calcTargets(d)?.calGoal} kcal/Tag</p></div></>)}
          {step === 6 && (<>
            <h2 style={{ color: "#fff", fontSize: 20, margin: "12px 0" }}>Bedingungen</h2>
            <div style={{ background: "#161616", padding: 12, borderRadius: 8, marginBottom: 12 }}><p style={{ fontSize: 11, color: "#999" }}>(AGB, die wir noch vereinbaren würden)</p></div>
            <label style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "#fff", fontSize: 12 }}><input type="checkbox" checked={d.agb} onChange={e => set("agb", e.target.checked)} style={{ marginTop: 3 }} />Ich akzeptiere die AGB und Datenschutzerklärung</label>
          </>)}
           </div>
          </div>
          <PrimaryBtn onClick={next} style={{ width: "100%", marginTop: 14, flexShrink: 0 }} disabled={step === 6 && !d.agb}>{step < steps ? "Weiter" : "Profil erstellen"}</PrimaryBtn>
        </Card>
      </div>
    </div>
  );
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [f, setF] = useState({ name: "", email: "", password: "", password2: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, v) => { setF(s => ({ ...s, [k]: v })); setError(""); };

  const submit = async () => {
    setBusy(true); setError("");
    try {
      const users = await loadGlobal("users", []);
      const email = f.email.trim().toLowerCase();

      if (mode === "register") {
        if (!f.name.trim()) { setError("Bitte gib deinen Namen ein."); return; }
        if (!email.includes("@") || !email.includes(".")) { setError("Bitte gib eine gültige E-Mail-Adresse ein."); return; }
        if (f.password.length < 6) { setError("Das Passwort muss mindestens 6 Zeichen haben."); return; }
        if (f.password !== f.password2) { setError("Die Passwörter stimmen nicht überein."); return; }
        if (users.some(u => u.email === email)) { setError("Für diese E-Mail existiert bereits ein Konto. Melde dich an."); return; }

        const user = { id: "u" + Date.now(), name: f.name.trim(), email, pwHash: await hashPassword(f.password), createdAt: Date.now() };
        await saveGlobal("users", [...users, user]);
        await saveGlobal("session", user.id);
        onLogin(user);
      } else {
        const user = users.find(u => u.email === email);
        if (!user) { setError("Kein Konto mit dieser E-Mail gefunden."); return; }
        const hash = await hashPassword(f.password);
        if (hash !== user.pwHash) { setError("Passwort falsch."); return; }
        await saveGlobal("session", user.id);
        onLogin(user);
      }
    } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", flexDirection: "column", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 400, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p style={{ fontSize: 40 }}>💪</p>
          <h1 style={{ color: "#F5C518", fontSize: 28, fontWeight: 800, marginTop: 8 }}>FitTrack</h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 6 }}>{mode === "login" ? "Melde dich an, um weiterzumachen" : "Erstelle dein Konto"}</p>
        </div>

        <Card>
          {mode === "register" && (
            <label style={{ fontSize: 12, color: "#fff", display: "block" }}>Name
              <input value={f.name} onChange={e => set("name", e.target.value)} placeholder="Dein Name" style={inputStyle} />
            </label>
          )}
          <label style={{ fontSize: 12, color: "#fff", display: "block", marginTop: mode === "register" ? 10 : 0 }}>E-Mail
            <input type="email" autoCapitalize="none" value={f.email} onChange={e => set("email", e.target.value)} placeholder="name@beispiel.ch" style={inputStyle} />
          </label>
          <label style={{ fontSize: 12, color: "#fff", display: "block", marginTop: 10 }}>Passwort
            <input type="password" value={f.password} onChange={e => set("password", e.target.value)} placeholder="mind. 6 Zeichen" style={inputStyle} />
          </label>
          {mode === "register" && (
            <label style={{ fontSize: 12, color: "#fff", display: "block", marginTop: 10 }}>Passwort wiederholen
              <input type="password" value={f.password2} onChange={e => set("password2", e.target.value)} placeholder="nochmal eingeben" style={inputStyle} />
            </label>
          )}

          {error && <p style={{ color: "#FF5555", fontSize: 12, marginTop: 10 }}>{error}</p>}

          <PrimaryBtn style={{ width: "100%", marginTop: 16 }} onClick={submit} disabled={busy}>
            {busy ? "Moment…" : mode === "login" ? "Anmelden" : "Konto erstellen"}
          </PrimaryBtn>

          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{ width: "100%", marginTop: 12, background: "none", border: "none", color: "#F5C518", fontSize: 12, cursor: "pointer" }}>
            {mode === "login" ? "Noch kein Konto? Jetzt registrieren" : "Schon ein Konto? Zur Anmeldung"}
          </button>
        </Card>

        <p style={{ fontSize: 10, color: "#555", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          Hinweis: Dein Konto wird auf diesem Gerät gespeichert. Eine geräteübergreifende Synchronisierung folgt in einer späteren Version.
        </p>
      </div>
    </div>
  );
}

function ConfirmAdjust({ title, message, detail, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Card style={{ maxWidth: 360, width: "100%" }}>
        <p style={{ color: "#F5C518", fontSize: 16, fontWeight: 800 }}>{title}</p>
        <p style={{ color: "#fff", fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{message}</p>
        {detail && <div style={{ background: "#0D0D0D", borderRadius: 8, padding: 10, marginTop: 10 }}><p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>{detail}</p></div>}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={onCancel} style={{ ...smallBtn, background: "#333", color: "#fff", flex: 1 }}>Nein, so lassen</button>
          <button onClick={onConfirm} style={{ ...smallBtn, flex: 1 }}>Ja, anpassen</button>
        </div>
      </Card>
    </div>
  );
}

function PremiumOffer({ onDismiss, onUpgrade }) {
  const benefits = [
    ["▦", "Strichcode-Suche", "Produkt scannen und exakte Herstellerwerte übernehmen"],
    ["🔍", "Rezept-Datenbank", "Nach Zutaten suchen und Mahlzeiten austauschen"],
    ["▶️", "Alle Videos", "Anleitungen zu jeder Übung und jedem Rezept"],
    ["📊", "Volle Auswertung", "Kreisdiagramm, Gewichtsverlauf & Nährstoff-Ranking"],
    ["🛠️", "Eigene Pläne", "Trainings- und Cardio-Pläne selbst zusammenstellen"],
    ["🗺️", "Routenplaner", "Rundstrecken passend zu deiner Tagesdistanz — ab Zuhause oder aktuellem Standort"],
    ["📸", "Foto-Tagebuch", "Fortschritt nach jedem Lauf festhalten und vergleichen"],
    ["💡", "Persönliche Tipps", "Erfahrungen direkt vom Macher der App"],
  ];
  return (
    <div style={{ minHeight: "100vh", height: "100vh", background: "#0D0D0D", padding: "16px", overflowY: "auto", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ textAlign: "right" }}>
          <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}><X size={22} color="#888" /></button>
        </div>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 40 }}>✨</p>
          <h1 style={{ color: "#F5C518", fontSize: 26, fontWeight: 800, marginTop: 8 }}>Hol dir Premium</h1>
          <p style={{ color: "#aaa", fontSize: 13, marginTop: 6 }}>Schalte alle Funktionen frei — oder starte erstmal gratis.</p>
        </div>
        <Card>
          {benefits.map(([emoji, title, desc], i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < benefits.length - 1 ? "1px solid #2A2A2A" : "none" }}>
              <span style={{ fontSize: 20 }}>{emoji}</span>
              <div><p style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{title}</p><p style={{ color: "#888", fontSize: 11, marginTop: 2 }}>{desc}</p></div>
            </div>
          ))}
        </Card>
        <div style={{ background: "rgba(245,197,24,0.1)", padding: 14, borderRadius: 10, marginTop: 12, textAlign: "center" }}>
          <p style={{ color: "#F5C518", fontWeight: 700, fontSize: 15 }}>CHF 4.99/Monat</p>
          <p style={{ color: "#888", fontSize: 11, marginTop: 2 }}>oder CHF 39.99/Jahr — spare 33%</p>
        </div>
        <PrimaryBtn style={{ width: "100%", marginTop: 12 }} onClick={onUpgrade}>Premium starten</PrimaryBtn>
        <button onClick={onDismiss} style={{ width: "100%", marginTop: 8, padding: 12, background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer" }}>Erstmal gratis weitermachen</button>
      </div>
    </div>
  );
}

// ================= HOME =================
function HomeTab({ profile, targets, selectedDate, setSelectedDate, weightLog, waterLog, mealLog, workoutLog, addWeight, addWater, isPremium, setShowPremium, resetPremium, authUser, onLogout }) {
  const [weightInput, setWeightInput] = useState("");
  const dayMeals = mealLog.filter(m => m.date === selectedDate);
  const dayWorkouts = workoutLog.filter(w => w.date === selectedDate);
  const dayWater = waterLog.filter(w => w.date === selectedDate).reduce((s, w) => s + w.amount, 0);
  const dayWeightEntries = weightLog.filter(w => w.date === selectedDate);
  const dayWeightEntry = dayWeightEntries[dayWeightEntries.length - 1];
  const kcal = dayMeals.reduce((s, m) => s + Number(m.kcal), 0);
  const protein = dayMeals.reduce((s, m) => s + Number(m.protein), 0);
  const carbs = dayMeals.reduce((s, m) => s + Number(m.carbs), 0);
  const fat = dayMeals.reduce((s, m) => s + Number(m.fat), 0);
  const rankedFoods = useMemo(() => {
    const agg = {};
    mealLog.forEach(m => { agg[m.name] = agg[m.name] || { name: m.name, kcal: 0, fat: 0, protein: 0 }; agg[m.name].kcal += Number(m.kcal); agg[m.name].fat += Number(m.fat); agg[m.name].protein += Number(m.protein); });
    const arr = Object.values(agg);
    return { kcal: [...arr].sort((a, b) => b.kcal - a.kcal)[0], fat: [...arr].sort((a, b) => b.fat - a.fat)[0], protein: [...arr].sort((a, b) => b.protein - a.protein)[0] };
  }, [mealLog]);

  return (
    <div style={{ paddingBottom: 90 }}>
      <Card style={{ marginBottom: 12 }}>
        {authUser && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #2A2A2A" }}>
            <div>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Hallo, {authUser.name} 👋</p>
              <p style={{ fontSize: 10, color: "#666" }}>{authUser.email}</p>
            </div>
            <button onClick={onLogout} style={{ fontSize: 10, background: "none", border: "1px solid #2A2A2A", borderRadius: 6, padding: "5px 10px", color: "#888", cursor: "pointer" }}>Abmelden</button>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} style={iconBtn}><ChevronLeft size={18} color="#fff" /></button>
          <p style={{ color: "#fff", fontWeight: 700, textTransform: "capitalize" }}>{selectedDate === todayStr() ? "Heute" : fmtDate(selectedDate)}</p>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} style={iconBtn} disabled={selectedDate >= todayStr()}><ChevronRight size={18} color={selectedDate >= todayStr() ? "#444" : "#fff"} /></button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
          {isPremium ? (
            <button onClick={resetPremium} style={{ fontSize: 9, background: "none", border: "1px solid #2A2A2A", borderRadius: 4, padding: "3px 8px", color: "#F5C518", cursor: "pointer" }}>✨ Premium aktiv · zum Testen deaktivieren</button>
          ) : (
            <button onClick={() => setShowPremium(true)} style={{ fontSize: 9, background: "none", border: "1px solid #2A2A2A", borderRadius: 4, padding: "3px 8px", color: "#888", cursor: "pointer" }}>🔒 Gratis-Version · Premium ansehen</button>
          )}
        </div>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Muted>Kalorien & Makros {!isPremium && <ProLock />}</Muted>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          {isPremium ? <MacroPie protein={protein} carbs={carbs} fat={fat} /> : (
            <button onClick={() => setShowPremium(true)} style={{ width: 100, height: 100, borderRadius: "50%", background: "#161616", border: "1px dashed #444", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Lock size={20} color="#F5C518" /><span style={{ fontSize: 9, color: "#888", marginTop: 4 }}>Freischalten</span>
            </button>
          )}
          <div style={{ fontSize: 12, color: "#ccc" }}>
            <p style={{ color: "#F5C518", fontWeight: 700, fontSize: 20 }}>{kcal} / {targets.calGoal} kcal</p>
            <p>Protein {protein}/{targets.proteinG}g</p>
            <p>Carbs {carbs}/{targets.carbsG}g</p>
            <p>Fett {fat}/{targets.fatG}g</p>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card>
          <Muted>Gewicht</Muted>
          <p style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginTop: 6 }}>{dayWeightEntry ? `${dayWeightEntry.weight} kg` : "—"}</p>
          {selectedDate === todayStr() && (
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <input type="number" step="0.1" placeholder="kg" value={weightInput} onChange={e => setWeightInput(e.target.value)} style={{ ...inputStyle, marginTop: 0, flex: 1 }} />
              <button onClick={() => { if (weightInput) { addWeight(weightInput); setWeightInput(""); } }} style={{ ...smallBtn, width: "auto", padding: "0 10px" }}><Plus size={14} /></button>
            </div>
          )}
          <Muted style={{ display: "block", marginTop: 10 }}>Gewichts-Tracking {!isPremium && <ProLock />}</Muted>
          {isPremium ? (
            weightLog.length > 1 ? (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={weightLog.slice(-20).map((w, i) => ({ date: fmtDate(w.date) + (weightLog.filter(x => x.date === w.date).length > 1 ? ` #${weightLog.filter(x => x.date === w.date).indexOf(w) + 1}` : ""), g: Number(w.weight) }))}>
                  <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" /><XAxis dataKey="date" stroke="#666" fontSize={9} /><YAxis stroke="#666" fontSize={9} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }} /><Line type="monotone" dataKey="g" stroke="#F5C518" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p style={{ fontSize: 11, color: "#666", marginTop: 6 }}>Trag mind. 2 Werte ein, um den Verlauf zu sehen.</p>
          ) : (
            <button onClick={() => setShowPremium(true)} style={{ width: "100%", aspectRatio: "1 / 1", maxHeight: 140, marginTop: 6, borderRadius: 10, background: "#161616", border: "1px dashed #444", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Lock size={20} color="#F5C518" /><span style={{ fontSize: 10, color: "#888", marginTop: 6 }}>Verlauf freischalten</span>
            </button>
          )}
        </Card>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Muted>Wasser</Muted>
            <span style={{ fontSize: 9, color: "#666" }}>Ziel: {waterGoalMl(profile.weight)} ml</span>
          </div>
          <p style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginTop: 6 }}>{dayWater} ml</p>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button onClick={() => addWater(-250)} style={{ ...smallBtn, background: "#333", color: "#fff", flex: 1 }}>-250ml</button>
            <button onClick={() => addWater(250)} style={{ ...smallBtn, flex: 1 }}>+250ml</button>
          </div>
        </Card>
      </div>

      <Card style={{ marginBottom: 12 }}>
        <Muted>Training</Muted>
        {dayWorkouts.length === 0 ? <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>Kein Training an diesem Tag</p> : dayWorkouts.map((w, i) => <p key={i} style={{ fontSize: 13, color: "#fff", marginTop: 6 }}>{w.exercise} — {w.weight}kg × {w.reps} × {w.sets}</p>)}
      </Card>

      <Card>
        <Muted>Nährstoff-Ranking (gesamt) {!isPremium && <ProLock />}</Muted>
        {isPremium ? (
          <div style={{ marginTop: 8, fontSize: 12, color: "#ccc" }}>
            {rankedFoods.kcal && <p>🔥 Meiste Kalorien: {rankedFoods.kcal.name}</p>}
            {rankedFoods.fat && <p style={{ marginTop: 4 }}>🥑 Meiste Fette: {rankedFoods.fat.name}</p>}
            {rankedFoods.protein && <p style={{ marginTop: 4 }}>💪 Meiste Eiweiß: {rankedFoods.protein.name}</p>}
          </div>
        ) : <button onClick={() => setShowPremium(true)} style={{ ...smallBtn, marginTop: 8 }}>Mit Premium freischalten</button>}
      </Card>
    </div>
  );
}

// ================= FOOD TAB =================
function FoodTab({ profile, targets, selectedDate, mealLog, addMeal, customFoods, addCustomFood, isPremium, setShowPremium, savedRecipes, addSavedRecipe, removeSavedRecipe, planOverrides, setPlanOverride }) {
  const [search, setSearch] = useState("");
  const [mealFilter, setMealFilter] = useState("Alle");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // {name, estimated, confidence, items:[{name,grams,kcal,...,factor}]}
  const [scanError, setScanError] = useState("");
  const [scanSource, setScanSource] = useState("");
  const [recipeSeed, setRecipeSeed] = useState(dayOfYear());
  const [swapTarget, setSwapTarget] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [barcodeBusy, setBarcodeBusy] = useState(false);
  const [portionMult, setPortionMult] = useState(1);
  const [recipePortions, setRecipePortions] = useState({});
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({ name: "", grams: "100", kcal: "", protein: "", carbs: "", fat: "", fiber: "" });

  const meals = ["Frühstück", "Mittag", "Abend", "Snack"];
  const dayMeals = mealLog.filter(m => m.date === selectedDate);

  const normItems = (items) => (items || []).map((it, i) => ({
    id: i, name: it.name || "Komponente", grams: Math.round(Number(it.grams) || 100),
    kcal: Math.round(Number(it.kcal) || 0), protein: Math.round(Number(it.protein) || 0),
    carbs: Math.round(Number(it.carbs) || 0), fat: Math.round(Number(it.fat) || 0),
    fiber: Math.round(Number(it.fiber) || 0), factor: 1, on: true,
  }));

  // Barcode aus einem Foto lesen (rein im Browser, ohne externe KI)
  const handleBarcodePhoto = async (e) => {
    if (!isPremium) { setShowPremium(true); return; }
    const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
    setScanning(true); setScanError(""); setScanResult(null); setPortionMult(1);
    try {
      const code = await detectBarcodeFromFile(file);
      if (!code) { setScanError("Kein Strichcode im Bild erkannt. Tippe die Nummer unter dem Strichcode manuell ein."); return; }
      const b = await lookupBarcode(code);
      if (b.per100) {
        const g = b.servingG || 100;
        setScanSource(`Strichcode ${code}`);
        setScanResult({ name: b.per100.name, per100: b.per100,
          items: normItems([{ name: b.per100.name, grams: g, kcal: b.per100.kcal * g / 100, protein: b.per100.protein * g / 100, carbs: b.per100.carbs * g / 100, fat: b.per100.fat * g / 100, fiber: b.per100.fiber * g / 100 }]) });
      } else if (b.notfound) setScanError("Produkt nicht in der Datenbank. Trag die Werte unten manuell ein.");
      else setScanError("Datenbank nicht erreichbar.");
    } catch { setScanError("Konnte das Bild nicht auswerten."); }
    finally { setScanning(false); }
  };

  const handleBarcodeLookup = async () => {
    const code = barcodeInput.trim();
    if (!code) return;
    setBarcodeBusy(true); setScanError(""); setScanResult(null); setPortionMult(1);
    const b = await lookupBarcode(code);
    setBarcodeBusy(false);
    if (b.per100) {
      const g = b.servingG || 100;
      setScanSource(`Barcode ${code}`);
      setScanResult({ name: b.per100.name, estimated: false, confidence: "hoch", per100: b.per100,
        items: normItems([{ name: b.per100.name, grams: g, kcal: b.per100.kcal * g / 100, protein: b.per100.protein * g / 100, carbs: b.per100.carbs * g / 100, fat: b.per100.fat * g / 100, fiber: b.per100.fiber * g / 100 }]) });
      setBarcodeOpen(false); setBarcodeInput("");
    } else if (b.notfound) setScanError("Produkt nicht in der Datenbank gefunden. Fotografiere stattdessen die Nährwerttabelle.");
    else setScanError("Datenbank nicht erreichbar. Versuch es später nochmal.");
  };

  // Gramm einer Komponente ändern → Nährwerte skalieren mit
  const setItemGrams = (id, grams) => setScanResult(s => ({ ...s, items: s.items.map(it => it.id === id ? { ...it, factor: Math.max(0, Number(grams) || 0) / (it.grams || 1) } : it) }));
  const toggleItem = (id) => setScanResult(s => ({ ...s, items: s.items.map(it => it.id === id ? { ...it, on: !it.on } : it) }));

  const scanTotals = useMemo(() => {
    if (!scanResult) return null;
    return scanResult.items.filter(it => it.on).reduce((a, it) => {
      const f = it.factor * portionMult;
      return { kcal: a.kcal + it.kcal * f, protein: a.protein + it.protein * f, carbs: a.carbs + it.carbs * f, fat: a.fat + it.fat * f, fiber: a.fiber + it.fiber * f };
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }, [scanResult, portionMult]);

  // Vorgeschlagenes Rezept pro Mahlzeit (mit möglichem Austausch)
  const suggestedFor = (meal) => {
    if (planOverrides[meal]) return recipeById(planOverrides[meal]);
    const pool = RECIPES.filter(r => r.meal === meal && r.goals.includes(profile.goalType));
    const fallback = RECIPES.filter(r => r.meal === meal);
    const use = pool.length ? pool : fallback;
    return use[pickIndex(use.length, recipeSeed)];
  };

  const searchResults = search || mealFilter !== "Alle" ? searchRecipes(search, mealFilter) : [];

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* SUCHE */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Muted>Rezepte nach Zutat suchen {!isPremium && <ProLock />}</Muted>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => { setManualOpen(o => !o); setBarcodeOpen(false); }} title="Werte selbst eintragen" style={{ height: 34, padding: "0 10px", background: "#333", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid #2A2A2A", color: "#F5C518", fontSize: 11, fontWeight: 700 }}>✏️ Eigenes</button>
            <button onClick={() => { if (!isPremium) { setShowPremium(true); return; } setBarcodeOpen(o => !o); setManualOpen(false); }} title="Strichcode" style={{ width: 40, height: 34, background: "#333", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid #2A2A2A", color: isPremium ? "#F5C518" : "#666", fontSize: 15 }}>▦</button>
          </div>
        </div>
        {isPremium ? (
          <>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="z.B. Banane, Apfel, Lachs..." style={{ ...inputStyle, marginTop: 8 }} />
            <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
              {["Alle", ...meals].map(m => (
                <button key={m} onClick={() => setMealFilter(m)} style={{ padding: "5px 9px", fontSize: 11, borderRadius: 6, cursor: "pointer", background: mealFilter === m ? "#F5C518" : "#161616", color: mealFilter === m ? "#111" : "#aaa", border: "1px solid #2A2A2A" }}>{m}</button>
              ))}
            </div>
          </>
        ) : (
          <button onClick={() => setShowPremium(true)} style={{ width: "100%", marginTop: 8, padding: 20, borderRadius: 10, background: "#161616", border: "1px dashed #444", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 6 }}>
            <Lock size={20} color="#F5C518" />
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Rezept-Datenbank freischalten</span>
            <span style={{ fontSize: 10, color: "#888", textAlign: "center" }}>Nach Zutaten suchen, Rezepte austauschen & Strichcode-Suche</span>
          </button>
        )}
      </Card>

      {/* MANUELLE EINGABE */}
      {manualOpen && (
        <Card style={{ marginBottom: 12 }}>
          <Muted>✏️ Eigenes Lebensmittel eintragen</Muted>
          <p style={{ fontSize: 10, color: "#888", marginTop: 4 }}>Für alles, was du zusätzlich zu den Menüs gegessen hast. Werte stehen auf der Verpackung.</p>
          <input value={manual.name} onChange={e => setManual(s => ({ ...s, name: e.target.value }))} placeholder="Name, z.B. Joghurt Natur" style={inputStyle} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
            <label style={{ fontSize: 10, color: "#888" }}>Menge (g/ml)<input type="number" inputMode="decimal" value={manual.grams} onChange={e => setManual(s => ({ ...s, grams: e.target.value }))} style={inputStyle} /></label>
            <label style={{ fontSize: 10, color: "#888" }}>Kalorien (kcal)<input type="number" inputMode="decimal" value={manual.kcal} onChange={e => setManual(s => ({ ...s, kcal: e.target.value }))} placeholder="z.B. 120" style={inputStyle} /></label>
            <label style={{ fontSize: 10, color: "#888" }}>Protein (g)<input type="number" inputMode="decimal" value={manual.protein} onChange={e => setManual(s => ({ ...s, protein: e.target.value }))} style={inputStyle} /></label>
            <label style={{ fontSize: 10, color: "#888" }}>Kohlenhydrate (g)<input type="number" inputMode="decimal" value={manual.carbs} onChange={e => setManual(s => ({ ...s, carbs: e.target.value }))} style={inputStyle} /></label>
            <label style={{ fontSize: 10, color: "#888" }}>Fett (g)<input type="number" inputMode="decimal" value={manual.fat} onChange={e => setManual(s => ({ ...s, fat: e.target.value }))} style={inputStyle} /></label>
            <label style={{ fontSize: 10, color: "#888" }}>Ballaststoffe (g)<input type="number" inputMode="decimal" value={manual.fiber} onChange={e => setManual(s => ({ ...s, fiber: e.target.value }))} style={inputStyle} /></label>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => setManualOpen(false)} style={{ ...smallBtn, background: "#333", color: "#fff", flex: 1 }}>Abbrechen</button>
            <button onClick={() => {
              if (!manual.name.trim() || !manual.kcal) { setScanError("Bitte mindestens Name und Kalorien eintragen."); return; }
              setScanSource("Selbst eingetragen"); setScanError(""); setPortionMult(1);
              setScanResult({ name: manual.name.trim(), items: normItems([{ name: manual.name.trim(), grams: Number(manual.grams) || 100, kcal: Number(manual.kcal) || 0, protein: Number(manual.protein) || 0, carbs: Number(manual.carbs) || 0, fat: Number(manual.fat) || 0, fiber: Number(manual.fiber) || 0 }]) });
              setManual({ name: "", grams: "100", kcal: "", protein: "", carbs: "", fat: "", fiber: "" });
              setManualOpen(false);
            }} style={{ ...smallBtn, flex: 1 }}>Übernehmen</button>
          </div>
        </Card>
      )}

      {/* BARCODE-EINGABE */}
      {isPremium && barcodeOpen && (
        <Card style={{ marginBottom: 12 }}>
          <Muted>▦ Produkt über Strichcode finden</Muted>
          <p style={{ fontSize: 10, color: "#888", marginTop: 4 }}>Tippe die Ziffernfolge unter dem Strichcode ein (8 oder 13 Ziffern). Die Werte kommen direkt vom Hersteller.</p>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <input inputMode="numeric" value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} placeholder="z.B. 7610807003001" style={{ ...inputStyle, marginTop: 0, flex: 1 }} />
            <button onClick={handleBarcodeLookup} disabled={barcodeBusy} style={{ ...smallBtn, width: "auto", padding: "9px 12px" }}>{barcodeBusy ? "…" : "Suchen"}</button>
          </div>
          {barcodeSupported() && (
            <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8, padding: 10, borderRadius: 8, background: "#161616", border: "1px dashed #2A2A2A", cursor: "pointer" }}>
              {scanning ? <Loader2 size={14} color="#F5C518" className="spin" /> : <Camera size={14} color="#F5C518" />}
              <span style={{ fontSize: 11, color: "#F5C518" }}>{scanning ? "Wird gelesen…" : "Strichcode fotografieren"}</span>
              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleBarcodePhoto} disabled={scanning} />
            </label>
          )}
          <button onClick={() => setBarcodeOpen(false)} style={{ ...smallBtn, background: "#333", color: "#fff", marginTop: 8 }}>Schließen</button>
        </Card>
      )}

      {/* SCAN-ERGEBNIS */}
      {scanError && <Card style={{ marginBottom: 12 }}><p style={{ fontSize: 12, color: "#FF5555" }}>{scanError}</p><p style={{ fontSize: 10, color: "#888", marginTop: 6, lineHeight: 1.4 }}>Tipp: Fotografiere den Teller von schräg oben, mit Besteck oder Hand als Größenvergleich. Bei Verpackungen die Nährwerttabelle oder den Strichcode.</p></Card>}

      {scanResult && scanTotals && (
        <Card style={{ marginBottom: 12, border: "1px solid #F5C518" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <Muted style={{ color: "#F5C518" }}>{scanSource}</Muted>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginTop: 2 }}>{scanResult.name}</p>
            </div>
            <button onClick={() => setScanResult(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={16} color="#888" /></button>
          </div>
          {scanResult.per100 && (
            <p style={{ fontSize: 10, color: "#888", marginTop: 4 }}>Herstellerangaben je 100 g: {scanResult.per100.kcal} kcal · {scanResult.per100.protein}g P · {scanResult.per100.carbs}g K · {scanResult.per100.fat}g F</p>
          )}

          {/* KOMPONENTEN */}
          <Muted style={{ display: "block", marginTop: 12, fontSize: 10 }}>Menge anpassen</Muted>
          {scanResult.items.map(it => {
            const g = Math.round(it.grams * it.factor);
            return (
              <div key={it.id} style={{ padding: "8px 0", borderBottom: "1px solid #2A2A2A", opacity: it.on ? 1 : 0.4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => toggleItem(it.id)} style={{ width: 18, height: 18, borderRadius: 4, border: `1px solid ${it.on ? "#F5C518" : "#555"}`, background: it.on ? "#F5C518" : "transparent", cursor: "pointer", flexShrink: 0, color: "#111", fontSize: 12, lineHeight: 1 }}>{it.on ? "✓" : ""}</button>
                  <p style={{ color: "#fff", fontSize: 13, flex: 1 }}>{it.name}</p>
                  <input type="number" value={g} onChange={e => setItemGrams(it.id, e.target.value)} style={{ width: 60, background: "#0D0D0D", border: "1px solid #2A2A2A", color: "#fff", borderRadius: 6, fontSize: 12, padding: 5, textAlign: "right" }} />
                  <span style={{ fontSize: 11, color: "#888" }}>g</span>
                </div>
                <p style={{ fontSize: 10, color: "#666", marginLeft: 26, marginTop: 2 }}>
                  {Math.round(it.kcal * it.factor * portionMult)} kcal · {Math.round(it.protein * it.factor * portionMult)}g P · {Math.round(it.carbs * it.factor * portionMult)}g K · {Math.round(it.fat * it.factor * portionMult)}g F
                </p>
              </div>
            );
          })}

          {/* PORTIONEN */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, padding: 10, background: "#0D0D0D", borderRadius: 8 }}>
            <div>
              <p style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>Portionen</p>
              <p style={{ fontSize: 10, color: "#888" }}>Wie viel davon hast du gegessen?</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setPortionMult(p => Math.max(0.25, Math.round((p - 0.25) * 100) / 100))} style={{ ...iconBtn, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18 }}>−</button>
              <span style={{ color: "#F5C518", fontSize: 16, fontWeight: 800, minWidth: 38, textAlign: "center" }}>{portionMult}×</span>
              <button onClick={() => setPortionMult(p => Math.round((p + 0.25) * 100) / 100)} style={{ ...iconBtn, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18 }}>+</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            {[0.5, 1, 1.5, 2].map(v => (
              <button key={v} onClick={() => setPortionMult(v)} style={{ flex: 1, padding: 6, fontSize: 11, borderRadius: 6, cursor: "pointer", background: portionMult === v ? "#F5C518" : "#161616", color: portionMult === v ? "#111" : "#aaa", border: "1px solid #2A2A2A" }}>{v}×</button>
            ))}
          </div>

          {/* SUMME */}
          <div style={{ background: "rgba(245,197,24,0.1)", borderRadius: 8, padding: 12, marginTop: 12 }}>
            <p style={{ color: "#F5C518", fontSize: 22, fontWeight: 800 }}>{Math.round(scanTotals.kcal)} kcal</p>
            <p style={{ fontSize: 11, color: "#ccc", marginTop: 4 }}>
              💪 {Math.round(scanTotals.protein)}g Protein · 🌾 {Math.round(scanTotals.carbs)}g Kohlenhydrate · 🥑 {Math.round(scanTotals.fat)}g Fett{scanTotals.fiber > 0 ? ` · 🌱 ${Math.round(scanTotals.fiber)}g Ballaststoffe` : ""}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button style={{ ...smallBtn, background: "#333", color: "#fff", flex: 1 }} onClick={() => setScanResult(null)}>Verwerfen</button>
            <button style={{ ...smallBtn, flex: 1 }} onClick={() => {
              addMeal({ name: scanResult.name + (portionMult !== 1 ? ` (${portionMult}×)` : ""), kcal: Math.round(scanTotals.kcal), protein: Math.round(scanTotals.protein), carbs: Math.round(scanTotals.carbs), fat: Math.round(scanTotals.fat), fiber: Math.round(scanTotals.fiber) });
              setScanResult(null); setPortionMult(1);
            }}>Zum Tag hinzufügen</button>
          </div>
        </Card>
      )}

      {/* SUCHERGEBNISSE */}
      {swapTarget && (
        <Card style={{ marginBottom: 12, border: "1px solid #F5C518" }}>
          <p style={{ color: "#F5C518", fontSize: 12, fontWeight: 700 }}>Austausch-Modus: {swapTarget}</p>
          <p style={{ fontSize: 11, color: "#888", marginTop: 4 }}>Such unten ein Rezept und tipp auf ➕ — es ersetzt dann direkt dein {swapTarget}.</p>
          <button onClick={() => setSwapTarget(null)} style={{ ...smallBtn, background: "#333", color: "#fff", marginTop: 8 }}>Austausch abbrechen</button>
        </Card>
      )}
      {isPremium && searchResults.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <Muted>{searchResults.length} Rezept(e) gefunden</Muted>
          <div style={{ maxHeight: 280, overflow: "auto", marginTop: 6 }}>
            {searchResults.map(r => {
              const m = recipeMacros(r);
              const already = savedRecipes.includes(r.id);
              const canSwapHere = swapTarget && r.meal === swapTarget;
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #2A2A2A" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#fff", fontSize: 13 }}>{r.name}</p>
                    <p style={{ fontSize: 10, color: "#888" }}>{r.meal} · {m.kcal} kcal · {m.protein}g P</p>
                  </div>
                  {canSwapHere ? (
                    <button onClick={() => { setPlanOverride(swapTarget, r.id); addSavedRecipe(r.id); setSwapTarget(null); setSearch(""); setMealFilter("Alle"); }} style={{ background: "#F5C518", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#111" }}>
                      Ersetzen
                    </button>
                  ) : (
                    <button onClick={() => already ? null : addSavedRecipe(r.id)} disabled={already} style={{ background: already ? "#333" : "#F5C518", border: "none", borderRadius: 6, padding: 6, cursor: already ? "default" : "pointer", display: "flex" }}>
                      <Plus size={14} color={already ? "#666" : "#111"} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
      {isPremium && (search || mealFilter !== "Alle") && searchResults.length === 0 && (
        <Card style={{ marginBottom: 12 }}><p style={{ fontSize: 12, color: "#999" }}>Keine Rezepte mit „{search}" gefunden.</p></Card>
      )}

      {/* TAGESVORSCHLÄGE MIT AUSTAUSCH */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Muted>Vorgeschlagene Rezepte für dein Ziel</Muted>
          <button onClick={() => setRecipeSeed(s => s + 1)} style={{ background: "none", border: "none", cursor: "pointer" }}><RefreshCw size={14} color="#F5C518" /></button>
        </div>
        {meals.map(meal => {
          const recipe = suggestedFor(meal); if (!recipe) return null;
          const macros = recipeMacros(recipe);
          const isSwapping = swapTarget === meal;
          return (
            <div key={meal} style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #2A2A2A" }}>
              <Muted style={{ color: "#F5C518" }}>{meal}</Muted>
              <p style={{ color: "#fff", fontSize: 14, marginTop: 2 }}>{recipe.name}</p>
              <p style={{ fontSize: 11, color: "#888" }}>
                {Math.round(macros.kcal * (recipePortions[meal] || 1))} kcal · {Math.round(macros.protein * (recipePortions[meal] || 1))}g P · {Math.round(macros.carbs * (recipePortions[meal] || 1))}g K · {Math.round(macros.fat * (recipePortions[meal] || 1))}g F
                {(recipePortions[meal] || 1) !== 1 && <span style={{ color: "#F5C518" }}> ({recipePortions[meal]}× Portion)</span>}
              </p>
              <p style={{ fontSize: 10, color: "#666", marginTop: 2 }}>Zutaten: {recipe.items.map(id => foodById(id)?.name).join(", ")}</p>
              <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                <button onClick={() => setRecipePortions(p => ({ ...p, [meal]: Math.max(0.5, (p[meal] || 1) - 0.5) }))} style={{ ...iconBtn, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>−</button>
                <span style={{ color: "#F5C518", fontSize: 12, fontWeight: 700, minWidth: 30, textAlign: "center" }}>{recipePortions[meal] || 1}×</span>
                <button onClick={() => setRecipePortions(p => ({ ...p, [meal]: (p[meal] || 1) + 0.5 }))} style={{ ...iconBtn, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>+</button>
                <button style={{ ...smallBtn, flex: 1 }} onClick={() => { const mult = recipePortions[meal] || 1; addMeal({ name: recipe.name + (mult !== 1 ? ` (${mult}×)` : ""), kcal: Math.round(macros.kcal * mult), protein: Math.round(macros.protein * mult), carbs: Math.round(macros.carbs * mult), fat: Math.round(macros.fat * mult) }); }}>Hinzufügen</button>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <button style={{ ...smallBtn, background: isSwapping ? "#F5C518" : "#333", color: isSwapping ? "#111" : "#fff", flex: 1 }} onClick={() => { if (!isPremium) { setShowPremium(true); return; } if (isSwapping) { setSwapTarget(null); } else { setSwapTarget(meal); setMealFilter(meal); window.scrollTo({ top: 0, behavior: "smooth" }); } }}>
                  {isSwapping ? "Abbrechen" : isPremium ? "Austauschen" : "🔒 Austauschen"}
                </button>
                {isPremium ? <a href={ytLink(recipe.name + " Rezept")} target="_blank" rel="noopener noreferrer" style={{ ...smallBtn, background: "#333", color: "#fff", width: 44, textDecoration: "none", textAlign: "center", padding: "8px 0" }}>▶</a>
                  : <button style={{ ...smallBtn, background: "#333", color: "#999", width: 44, padding: "8px 0" }} onClick={() => setShowPremium(true)}>🔒</button>}
              </div>
              {isSwapping && (
                <div style={{ marginTop: 8, padding: 8, background: "#0D0D0D", borderRadius: 8 }}>
                  <Muted style={{ fontSize: 11 }}>Womit ersetzen? (aus deiner Merkliste)</Muted>
                  {savedRecipes.filter(id => recipeById(id)?.meal === meal).length === 0 ? (
                    <p style={{ fontSize: 11, color: "#666", marginTop: 6 }}>Noch keine {meal}-Rezepte gemerkt. Such oben eins und tipp auf ➕.</p>
                  ) : savedRecipes.filter(id => recipeById(id)?.meal === meal).map(id => {
                    const r = recipeById(id);
                    return (
                      <button key={id} onClick={() => { setPlanOverride(meal, id); setSwapTarget(null); }} style={{ display: "block", width: "100%", textAlign: "left", padding: 8, marginTop: 6, background: "#161616", border: "1px solid #2A2A2A", borderRadius: 6, color: "#fff", fontSize: 12, cursor: "pointer" }}>
                        {r.name} <span style={{ color: "#888" }}>· {recipeMacros(r).kcal} kcal</span>
                      </button>
                    );
                  })}
                  {planOverrides[meal] && <button onClick={() => { setPlanOverride(meal, null); setSwapTarget(null); }} style={{ ...smallBtn, background: "#333", color: "#fff", marginTop: 8 }}>Zurück zum Vorschlag</button>}
                </div>
              )}
            </div>
          );
        })}
      </Card>

      {/* MERKLISTE */}
      {isPremium && (
      <Card style={{ marginBottom: 12 }}>
        <Muted>Gemerkte Rezepte ({savedRecipes.length})</Muted>
        {savedRecipes.length === 0 ? <p style={{ fontSize: 11, color: "#666", marginTop: 6 }}>Such oben nach einer Zutat und tipp auf ➕, um Rezepte hier zu sammeln.</p> :
          savedRecipes.map(id => {
            const r = recipeById(id); if (!r) return null;
            const m = recipeMacros(r);
            return (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #2A2A2A" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#fff", fontSize: 13 }}>{r.name}</p>
                  <p style={{ fontSize: 10, color: "#888" }}>{r.meal} · {m.kcal} kcal</p>
                </div>
                <button onClick={() => { if (swapTarget && r.meal === swapTarget) { setPlanOverride(swapTarget, r.id); setSwapTarget(null); } else { addMeal({ name: r.name, ...m }); } }} style={{ background: "#F5C518", border: "none", borderRadius: 6, padding: swapTarget && r.meal === swapTarget ? "6px 10px" : 6, cursor: "pointer", display: "flex", fontSize: 11, fontWeight: 700, color: "#111" }}>
                  {swapTarget && r.meal === swapTarget ? "Ersetzen" : <Plus size={13} color="#111" />}
                </button>
                <button onClick={() => removeSavedRecipe(id)} style={{ background: "none", border: "1px solid #2A2A2A", borderRadius: 6, padding: 6, cursor: "pointer", display: "flex" }}><Trash2 size={13} color="#FF5555" /></button>
              </div>
            );
          })}
      </Card>
      )}

      {/* HEUTE GEGESSEN */}
      <Card>
        <Muted>Heute gegessen ({dayMeals.length}) · {dayMeals.reduce((s, m) => s + Number(m.kcal), 0)} kcal</Muted>
        {dayMeals.length === 0 ? <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>Noch nichts eingetragen</p> :
          dayMeals.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #2A2A2A", fontSize: 13 }}>
              <span style={{ color: "#fff" }}>{m.name}</span>
              <span style={{ color: "#888" }}>{m.kcal} kcal · {m.protein}g P</span>
            </div>
          ))}
      </Card>
    </div>
  );
}

// ================= TRAINING TAB =================
function TrainingTab({ profile, workoutLog, addWorkout, plans, activePlanId, savePlan, setActivePlan, deletePlan, isPremium, setShowPremium, dayRatings, setDayRating }) {
  const [openPlanId, setOpenPlanId] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [logForm, setLogForm] = useState({ exercise: "", weight: "", reps: "", sets: "", difficulty: "passend" });
  const [progressExercise, setProgressExercise] = useState("");
  const recSplit = recommendedSplitId(profile.fitnessLevel);
  const openPlan = plans.find(p => p.id === openPlanId);

  useEffect(() => { if (!plans.length) savePlan(generatePlanFromSplit(recSplit, profile.goalType, profile.fitnessLevel), true); }, []); // eslint-disable-line

  const selectSplit = (splitId) => { const p = generatePlanFromSplit(splitId, profile.goalType, profile.fitnessLevel); savePlan(p, true); setOpenPlanId(p.id); };

  const exerciseNames = [...new Set(workoutLog.map(w => w.exercise))];
  const history = workoutLog.filter(w => w.exercise === progressExercise);
  const diffColor = { leichter: "#7CFC00", passend: "#F5C518", schwerer: "#FF5555" };

  if (openPlan) return <PlanDetailPage plan={openPlan} profile={profile} onBack={() => setOpenPlanId(null)} savePlan={savePlan} isPremium={isPremium} setShowPremium={setShowPremium} dayRatings={dayRatings} setDayRating={setDayRating} />;

  return (
    <div style={{ paddingBottom: 90 }}>
      {builderOpen && <PlanBuilder onClose={() => setBuilderOpen(false)} onSave={(p) => { savePlan(p, false); setBuilderOpen(false); setOpenPlanId(p.id); }} />}

      <SectionHeading>🏋️ Trainingspläne</SectionHeading>

      <Card style={{ marginBottom: 12 }}>
        <Muted>Wähle einen Split — tippe an, um den Wochenplan zu öffnen</Muted>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {SPLITS.map(s => {
            const existing = plans.find(p => p.splitId === s.id);
            const recommended = s.recommendedFor.includes(profile.fitnessLevel);
            return (
              <button key={s.id} onClick={() => existing ? setOpenPlanId(existing.id) : selectSplit(s.id)} style={{ textAlign: "left", padding: 12, borderRadius: 8, cursor: "pointer", background: existing ? "rgba(245,197,24,0.1)" : "#161616", border: `1px solid ${existing ? "#F5C518" : "#2A2A2A"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{s.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {recommended && <span style={{ fontSize: 9, background: "#F5C518", color: "#111", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>EMPFOHLEN</span>}
                    <ChevronRight size={16} color="#666" />
                  </div>
                </div>
                <p style={{ fontSize: 11, color: "#F5C518", marginTop: 2 }}>{s.days_label}</p>
                <p style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.desc}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {plans.filter(p => p.type === "custom").length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <Muted>Eigene Pläne</Muted>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {plans.filter(p => p.type === "custom").map(p => (
              <div key={p.id} style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setOpenPlanId(p.id)} style={{ flex: 1, textAlign: "left", padding: 12, borderRadius: 8, cursor: "pointer", background: "#161616", border: "1px solid #2A2A2A", color: "#fff", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {p.name} <ChevronRight size={16} color="#666" />
                </button>
                <button onClick={() => deletePlan(p.id)} style={{ background: "none", border: "1px solid #2A2A2A", borderRadius: 8, padding: "0 10px", cursor: "pointer" }}><Trash2 size={14} color="#FF5555" /></button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 12 }}>
        {isPremium ? <PrimaryBtn style={{ width: "100%" }} onClick={() => setBuilderOpen(true)}>+ Eigenen Plan zusammenstellen</PrimaryBtn>
          : <button onClick={() => setShowPremium(true)} style={{ ...smallBtn }}>🔒 Eigenen Plan zusammenstellen (Premium)</button>}
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Muted>Satz protokollieren</Muted>
        <input list="ex-list" value={logForm.exercise} onChange={e => setLogForm(s => ({ ...s, exercise: e.target.value }))} placeholder="Übung" style={inputStyle} />
        <datalist id="ex-list">{EXERCISES.map(e => <option key={e.id} value={e.name} />)}</datalist>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
          <input type="number" placeholder="kg" value={logForm.weight} onChange={e => setLogForm(s => ({ ...s, weight: e.target.value }))} style={inputStyle} />
          <input type="number" placeholder="Wdh" value={logForm.reps} onChange={e => setLogForm(s => ({ ...s, reps: e.target.value }))} style={inputStyle} />
          <input type="number" placeholder="Sätze" value={logForm.sets} onChange={e => setLogForm(s => ({ ...s, sets: e.target.value }))} style={inputStyle} />
        </div>
        <Muted style={{ display: "block", marginTop: 8 }}>Wie war's im Vergleich zum letzten Mal?</Muted>
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {["leichter", "passend", "schwerer"].map(d => (
            <button key={d} onClick={() => setLogForm(s => ({ ...s, difficulty: d }))} style={{ flex: 1, padding: 8, borderRadius: 6, fontSize: 11, cursor: "pointer", background: logForm.difficulty === d ? diffColor[d] : "#161616", color: logForm.difficulty === d ? "#111" : "#fff", border: "1px solid #2A2A2A", textTransform: "capitalize" }}>{d}</button>
          ))}
        </div>
        <PrimaryBtn style={{ width: "100%", marginTop: 8 }} onClick={() => { if (logForm.exercise && logForm.weight) { addWorkout({ ...logForm, date: todayStr() }); setLogForm({ exercise: "", weight: "", reps: "", sets: "", difficulty: "passend" }); } }}>Speichern</PrimaryBtn>
      </Card>

      {exerciseNames.length > 0 && (
        <Card>
          <Muted>Gewichts-Fortschritt pro Übung</Muted>
          <select value={progressExercise} onChange={e => setProgressExercise(e.target.value)} style={inputStyle}>
            <option value="">Übung wählen…</option>{exerciseNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          {progressExercise && history.length > 0 && (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={history.map(h => ({ date: fmtDate(h.date), kg: Number(h.weight) }))}>
                  <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" /><XAxis dataKey="date" stroke="#666" fontSize={9} /><YAxis stroke="#666" fontSize={9} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }} /><Line type="monotone" dataKey="kg" stroke="#F5C518" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 8 }}>{[...history].reverse().slice(0, 5).map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderBottom: "1px solid #2A2A2A" }}>
                  <span style={{ color: "#888" }}>{fmtDate(h.date)}</span><span style={{ color: "#fff" }}>{h.weight}kg</span>
                  <span style={{ color: diffColor[h.difficulty] || "#888", textTransform: "capitalize" }}>{h.difficulty || "—"}</span>
                </div>
              ))}</div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}

// ===== PLAN-DETAILSEITE MIT WOCHENTAGEN =====
function PlanDetailPage({ plan, profile, onBack, savePlan, isPremium, setShowPremium, dayRatings, setDayRating }) {
  const todayWd = (new Date().getDay() + 6) % 7;
  const [selectedWd, setSelectedWd] = useState(todayWd);
  const [pickerFor, setPickerFor] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [appliedNote, setAppliedNote] = useState(null);
  const dayPlan = plan.days.find(d => d.weekday === selectedWd);
  const dateForWd = addDays(todayStr(), selectedWd - todayWd);
  const ratingKey = `${plan.id}-${dateForWd}`;
  const currentRating = dayRatings[ratingKey];

  const swapExercise = (exIdx, newEx) => {
    const dayIdx = plan.days.findIndex(d => d.weekday === selectedWd);
    const updated = { ...plan, days: plan.days.map((d, di) => di !== dayIdx ? d : { ...d, exercises: d.exercises.map((ex, ei) => ei !== exIdx ? ex : { ...ex, exId: newEx.id }) }) };
    savePlan(updated, false); setPickerFor(null);
  };
  const removeExercise = (exIdx) => {
    const dayIdx = plan.days.findIndex(d => d.weekday === selectedWd);
    const updated = { ...plan, days: plan.days.map((d, di) => di !== dayIdx ? d : { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIdx) }) };
    savePlan(updated, false);
  };
  const addExercise = (newEx) => {
    const dayIdx = plan.days.findIndex(d => d.weekday === selectedWd);
    if (dayIdx === -1) return;
    const sr = setsRepsFor(profile.goalType);
    const updated = { ...plan, days: plan.days.map((d, di) => di !== dayIdx ? d : { ...d, exercises: [...d.exercises, { exId: newEx.id, sets: sr.sets, reps: sr.reps }] }) };
    savePlan(updated, false); setPickerFor(null);
  };

  const handleRating = (rating) => {
    setDayRating(ratingKey, rating);
    setAppliedNote(null);
    if (rating === "gut") { setAppliedNote("Notiert — dein Plan bleibt auf diesem Niveau."); return; }
    const result = adjustStrengthDay(plan, selectedWd, rating);
    if (!result) return;
    setConfirmData({ rating, result });
  };

  return (
    <div style={{ paddingBottom: 90 }}>
      {pickerFor && <ExercisePicker onClose={() => setPickerFor(null)} onSelect={(ex) => pickerFor.mode === "add" ? addExercise(ex) : swapExercise(pickerFor.exIdx, ex)} />}
      {confirmData && (
        <ConfirmAdjust
          title={confirmData.rating === "zu leicht" ? "Training erhöhen?" : "Training reduzieren?"}
          message={confirmData.rating === "zu leicht"
            ? `Du fandest ${dayPlan?.title} zu leicht. Soll ich diesen Trainingstag ab jetzt fordernder machen — also auch nächste Woche und danach?`
            : `Du fandest ${dayPlan?.title} zu schwer. Soll ich diesen Trainingstag ab jetzt etwas leichter machen — also auch nächste Woche und danach?`}
          detail={`Änderung: ${confirmData.result.changes.join(" · ")}`}
          onCancel={() => { setConfirmData(null); setAppliedNote("Notiert — der Plan bleibt unverändert."); }}
          onConfirm={() => { savePlan(confirmData.result.updated, false); setAppliedNote(`Plan dauerhaft angepasst: ${confirmData.result.changes.join(", ")}. Gilt ab sofort für jede Woche.`); setConfirmData(null); }}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <button onClick={onBack} style={iconBtn}><ChevronLeft size={18} color="#fff" /></button>
        <div>
          <p style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{plan.name}</p>
          {plan.daysLabel && <p style={{ fontSize: 11, color: "#F5C518" }}>{plan.daysLabel}</p>}
        </div>
      </div>

      {/* WOCHENTAGE */}
      <Card style={{ marginBottom: 12 }}>
        <Muted>Woche im Überblick</Muted>
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          {WEEKDAYS.map((wd, i) => {
            const has = plan.days.some(d => d.weekday === i);
            const active = selectedWd === i;
            return (
              <button key={i} onClick={() => setSelectedWd(i)} style={{ flex: 1, padding: "8px 2px", borderRadius: 8, cursor: "pointer", background: active ? "#F5C518" : has ? "rgba(245,197,24,0.15)" : "#161616", border: `1px solid ${active ? "#F5C518" : "#2A2A2A"}`, color: active ? "#111" : has ? "#F5C518" : "#555" }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{wd}</div>
                <div style={{ fontSize: 8, marginTop: 2 }}>{has ? "Training" : "Rest"}</div>
                {i === todayWd && <div style={{ fontSize: 7, marginTop: 1 }}>heute</div>}
              </button>
            );
          })}
        </div>
      </Card>

      {/* TAGESINHALT */}
      {dayPlan ? (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Muted>{["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"][selectedWd]}</Muted>
              <p style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginTop: 2 }}>{dayPlan.title}</p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: "#888", marginTop: 6 }}>{setsRepsFor(profile.goalType).note}</p>

          {dayPlan.exercises.map((exRef, ei) => {
            const ex = exById(exRef.exId); if (!ex) return null;
            return (
              <div key={ei} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #222" }}>
                <MuscleDiagram muscle={ex.muscle} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#fff", fontSize: 13 }}>{ex.name}</p>
                  <p style={{ fontSize: 11, color: "#F5C518" }}>{exRef.sets} Sätze × {exRef.reps} Wdh.{exRef.targetIncrease ? ` · Ziel ${exRef.targetIncrease > 0 ? "+" : ""}${exRef.targetIncrease} kg` : ""}</p>
                  <p style={{ fontSize: 10, color: "#666" }}>{ex.equip} · {ex.muscle}</p>
                  {ex.seatTip && <p style={{ fontSize: 10, color: "#666", marginTop: 2 }}>⚙️ {ex.seatTip}</p>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {isPremium ? <a href={ytLink(ex.name + " Anleitung")} target="_blank" rel="noopener noreferrer" style={{ border: "1px solid #2A2A2A", borderRadius: 6, padding: 5, display: "flex" }}><Play size={12} color="#F5C518" /></a>
                    : <button onClick={() => setShowPremium(true)} style={{ background: "none", border: "1px solid #2A2A2A", borderRadius: 6, padding: 5, cursor: "pointer", display: "flex" }}><Lock size={12} color="#666" /></button>}
                  <button onClick={() => setPickerFor({ mode: "swap", exIdx: ei })} style={{ background: "none", border: "1px solid #2A2A2A", borderRadius: 6, padding: 5, cursor: "pointer", display: "flex" }}><RefreshCw size={12} color="#F5C518" /></button>
                  <button onClick={() => removeExercise(ei)} style={{ background: "none", border: "1px solid #2A2A2A", borderRadius: 6, padding: 5, cursor: "pointer", display: "flex" }}><Trash2 size={12} color="#FF5555" /></button>
                </div>
              </div>
            );
          })}
          <button onClick={() => setPickerFor({ mode: "add" })} style={{ ...smallBtn, background: "#333", color: "#fff", marginTop: 10 }}>+ Übung hinzufügen</button>
        </Card>
      ) : (
        <Card style={{ marginBottom: 12, textAlign: "center", padding: 30 }}>
          <p style={{ fontSize: 32 }}>😴</p>
          <p style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginTop: 8 }}>Rest Day</p>
          <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Erholung ist Teil des Trainings — dein Körper baut jetzt auf.</p>
        </Card>
      )}

      {/* TAGES-FEEDBACK */}
      {dayPlan && (
        <Card>
          <Muted>Wie ging es dir an diesem Tag?</Muted>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {[["zu leicht", "😌"], ["gut", "👍"], ["zu schwer", "🥵"]].map(([r, emoji]) => (
              <button key={r} onClick={() => handleRating(r)} style={{ flex: 1, padding: "10px 4px", borderRadius: 8, cursor: "pointer", fontSize: 11, background: currentRating === r ? "#F5C518" : "#161616", color: currentRating === r ? "#111" : "#fff", border: "1px solid #2A2A2A" }}>
                <div style={{ fontSize: 18 }}>{emoji}</div>{r}
              </button>
            ))}
          </div>
          {appliedNote && <p style={{ fontSize: 11, color: "#F5C518", marginTop: 10, lineHeight: 1.5 }}>✅ {appliedNote}</p>}
          {!appliedNote && currentRating && <p style={{ fontSize: 11, color: "#888", marginTop: 8 }}>Notiert für {fmtDate(dateForWd)}.</p>}
        </Card>
      )}
    </div>
  );
}

function PlanBuilder({ onClose, onSave }) {
  const [name, setName] = useState("Mein Plan");
  const [days, setDays] = useState([{ title: "Tag 1", weekday: 0, exercises: [] }]);
  const [pickerDay, setPickerDay] = useState(null);
  const [activeMuscle, setActiveMuscle] = useState({});

  const setDayMuscleFilter = (di, m) => setActiveMuscle(s => ({ ...s, [di]: m }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1100, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1A1A1A", width: "100%", maxHeight: "88vh", borderRadius: "18px 18px 0 0", padding: 16, overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p style={{ color: "#fff", fontWeight: 700 }}>Eigenen Plan zusammenstellen</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color="#888" /></button>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Plan-Name" style={inputStyle} />

        {days.map((day, di) => (
          <div key={di} style={{ marginTop: 12, padding: 10, background: "#0D0D0D", borderRadius: 10 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input value={day.title} onChange={e => setDays(ds => ds.map((d, i) => i === di ? { ...d, title: e.target.value } : d))} style={{ ...inputStyle, marginTop: 0, flex: 1 }} />
              <select value={day.weekday} onChange={e => setDays(ds => ds.map((d, i) => i === di ? { ...d, weekday: Number(e.target.value) } : d))} style={{ ...inputStyle, marginTop: 0, width: 80 }}>
                {WEEKDAYS.map((wd, wi) => <option key={wi} value={wi}>{wd}</option>)}
              </select>
              <button onClick={() => setDays(ds => ds.filter((_, i) => i !== di))} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={16} color="#FF5555" /></button>
            </div>

            <Muted style={{ display: "block", marginTop: 10, fontSize: 10 }}>Muskelgruppe wählen, dann Übungen hinzufügen</Muted>
            <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
              {MUSCLE_LIST.map(m => (
                <button key={m} onClick={() => setDayMuscleFilter(di, activeMuscle[di] === m ? null : m)} style={{ padding: "5px 9px", fontSize: 11, borderRadius: 6, cursor: "pointer", background: activeMuscle[di] === m ? "#F5C518" : "#161616", color: activeMuscle[di] === m ? "#111" : "#aaa", border: "1px solid #2A2A2A" }}>{m}</button>
              ))}
            </div>

            {activeMuscle[di] && (
              <div style={{ marginTop: 8, maxHeight: 180, overflow: "auto", background: "#161616", borderRadius: 8, padding: 6 }}>
                {EXERCISES.filter(e => e.muscle === activeMuscle[di]).map(ex => {
                  const added = day.exercises.some(x => x.exId === ex.id);
                  return (
                    <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #2A2A2A" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "#fff", fontSize: 12 }}>{ex.name}</p>
                        <p style={{ color: "#888", fontSize: 10 }}>{ex.equip}</p>
                      </div>
                      <a href={ytLink(ex.name + " Anleitung")} target="_blank" rel="noopener noreferrer" style={{ border: "1px solid #2A2A2A", borderRadius: 5, padding: 4, display: "flex" }}><Play size={11} color="#F5C518" /></a>
                      <button disabled={added} onClick={() => setDays(ds => ds.map((d, i) => i !== di ? d : { ...d, exercises: [...d.exercises, { exId: ex.id, sets: 3, reps: "10" }] }))} style={{ background: added ? "#333" : "#F5C518", border: "none", borderRadius: 5, padding: 5, cursor: added ? "default" : "pointer", display: "flex" }}>
                        <Plus size={12} color={added ? "#666" : "#111"} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {day.exercises.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <Muted style={{ fontSize: 10 }}>Ausgewählt ({day.exercises.length})</Muted>
                {day.exercises.map((exRef, ei) => {
                  const ex = exById(exRef.exId);
                  return (
                    <div key={ei} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: 12, color: "#fff", borderBottom: "1px solid #222" }}>
                      <span style={{ flex: 1 }}>{ex?.name}</span>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <input type="number" value={exRef.sets} onChange={e => setDays(ds => ds.map((d, i) => i !== di ? d : { ...d, exercises: d.exercises.map((x, xi) => xi === ei ? { ...x, sets: e.target.value } : x) }))} style={{ width: 34, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", borderRadius: 4, fontSize: 11, padding: 3 }} />
                        <span style={{ color: "#666" }}>×</span>
                        <input value={exRef.reps} onChange={e => setDays(ds => ds.map((d, i) => i !== di ? d : { ...d, exercises: d.exercises.map((x, xi) => xi === ei ? { ...x, reps: e.target.value } : x) }))} style={{ width: 42, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", borderRadius: 4, fontSize: 11, padding: 3 }} />
                        <button onClick={() => setDays(ds => ds.map((d, i) => i !== di ? d : { ...d, exercises: d.exercises.filter((_, xi) => xi !== ei) }))} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><Trash2 size={12} color="#FF5555" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <button onClick={() => setDays(ds => [...ds, { title: `Tag ${ds.length + 1}`, weekday: Math.min(6, ds.length * 2), exercises: [] }])} style={{ ...smallBtn, background: "#333", color: "#fff", marginTop: 10 }}>+ Tag hinzufügen</button>
        <PrimaryBtn style={{ width: "100%", marginTop: 12 }} onClick={() => onSave({ id: "custom-" + Date.now(), name, daysLabel: `${days.length} Tage/Woche`, type: "custom", days })}><Save size={14} style={{ display: "inline", marginRight: 6 }} />Plan speichern</PrimaryBtn>
      </div>
    </div>
  );
}

// ================= CARDIO TAB =================
function CardioTab({ profile, cardioLog, addCardio, setCardioFeedback, cardioPlans, activeCardioPlanId, saveCardioPlan, setActiveCardioPlan, deleteCardioPlan, isPremium, setShowPremium, runPhotos, addRunPhoto, deleteRunPhoto, homeAddress, setHomeAddress }) {
  const [f, setF] = useState({ type: "Laufen", distance: "", duration: "" });
  const [builderOpen, setBuilderOpen] = useState(false);
  const [adaptBanner, setAdaptBanner] = useState(null);
  const [photoView, setPhotoView] = useState(false);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [detailNote, setDetailNote] = useState(null);
  const [pendingCardioAdjust, setPendingCardioAdjust] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const activePlan = cardioPlans.find(p => p.id === activeCardioPlanId);
  const recPlanTypeId = CARDIO_PLAN_TYPES.find(t => t.goal === profile.runGoal)?.id || "ausdauer";

  const selectPlanType = (id) => { const p = generateCardioPlanByType(id, profile); saveCardioPlan(p, true); };
  useEffect(() => { if (!cardioPlans.length) selectPlanType(recPlanTypeId); }, []); // eslint-disable-line

  // SOFORTIGE Anpassung bei jedem Feedback
  const handleFeedback = async (idx, fb) => {
    await setCardioFeedback(idx, fb);
    if (fb === "passend" || !activePlan || activePlan.type !== "suggested") { setAdaptBanner("Notiert — dein Plan bleibt auf diesem Niveau."); return; }
    const updated = applyFeedbackToPlan(activePlan, fb, profile);
    if (updated) setPendingCardioAdjust({ fb, updated });
  };

  const handlePhotoUpload = async (e) => {
    if (!isPremium) { setShowPremium(true); return; }
    const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
    setUploadingPhoto(true);
    try {
      const dataUrl = await new Promise((res, rej) => {
        const img = new Image(); const reader = new FileReader();
        reader.onload = () => { img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxW = 400; const scale = Math.min(1, maxW / img.width);
          canvas.width = img.width * scale; canvas.height = img.height * scale;
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          res(canvas.toDataURL("image/jpeg", 0.6));
        }; img.onerror = rej; img.src = reader.result; };
        reader.onerror = rej; reader.readAsDataURL(file);
      });
      await addRunPhoto({ date: todayStr(), time: Date.now(), img: dataUrl });
    } catch { alert("Foto konnte nicht gespeichert werden."); }
    finally { setUploadingPhoto(false); }
  };

  const upcoming = activePlan ? nextDaysPreview(activePlan) : [];
  const weekRuns = cardioLog.filter(c => daysAgo(c.date) <= 7).length;
  const todayPhotos = runPhotos.filter(p => p.date === todayStr());

  return (
    <div style={{ paddingBottom: 90 }}>
      {builderOpen && <CardioPlanBuilder onClose={() => setBuilderOpen(false)} onSave={(p) => { saveCardioPlan(p, false); setBuilderOpen(false); }} runGoal={profile.runGoal} />}
      {photoView && <PhotoDiary photos={runPhotos} onClose={() => setPhotoView(false)} onDelete={deleteRunPhoto} />}
      {sessionDetail && <SessionDetail day={sessionDetail} plan={activePlan} onClose={() => { setSessionDetail(null); setDetailNote(null); }} adaptNote={detailNote} homeAddress={homeAddress} onSaveHome={setHomeAddress} isPremium={isPremium} setShowPremium={setShowPremium}
        onFeedback={async (fb, dist, mins) => {
          await addCardio({ type: "Laufen", distance: dist, duration: mins, date: todayStr(), feedback: fb });
          if (fb === "passend") { setDetailNote("Notiert — dein Plan bleibt auf diesem Niveau."); return; }
          const updated = applyFeedbackToPlan(activePlan, fb, profile);
          if (updated) setPendingCardioAdjust({ fb, updated });
        }} />}
      {pendingCardioAdjust && (
        <ConfirmAdjust
          title={pendingCardioAdjust.fb === "zu leicht" ? "Cardio erhöhen?" : "Cardio reduzieren?"}
          message={pendingCardioAdjust.fb === "zu leicht"
            ? "Du fandest die Einheit zu leicht. Soll ich deinen Laufplan ab jetzt fordernder machen — auch für die kommenden Wochen?"
            : "Du fandest die Einheit zu anstrengend. Soll ich deinen Laufplan ab jetzt lockerer machen — auch für die kommenden Wochen?"}
          detail={`Neues Zieltempo: ${pendingCardioAdjust.updated.targetPace} min/km${pendingCardioAdjust.fb === "zu leicht" ? " · Strecken etwas länger" : " · Strecken etwas kürzer"}`}
          onCancel={() => { setPendingCardioAdjust(null); setDetailNote("Notiert — der Plan bleibt unverändert."); setAdaptBanner("Notiert — der Plan bleibt unverändert."); }}
          onConfirm={async () => { await saveCardioPlan(pendingCardioAdjust.updated, false); const msg = `Plan dauerhaft angepasst: Zieltempo jetzt ${pendingCardioAdjust.updated.targetPace} min/km. Gilt ab sofort für alle kommenden Wochen.`; setDetailNote(msg); setAdaptBanner(msg); setPendingCardioAdjust(null); }}
        />
      )}

      <SectionHeading>🏃 Dein aktueller Cardio-Plan</SectionHeading>

      {adaptBanner && (
        <Card style={{ marginBottom: 12, border: "1px solid #F5C518", background: "rgba(245,197,24,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <p style={{ fontSize: 12, color: "#F5C518", lineHeight: 1.5 }}>🔄 {adaptBanner}</p>
            <button onClick={() => setAdaptBanner(null)} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}><X size={14} color="#888" /></button>
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 12 }}>
        <Muted>Verschiedene Trainingspläne — wähle deinen Fokus</Muted>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {CARDIO_PLAN_TYPES.map(t => {
            const active = activePlan?.planTypeId === t.id;
            const recommended = t.id === recPlanTypeId;
            return (
              <button key={t.id} onClick={() => selectPlanType(t.id)} style={{ textAlign: "left", padding: 10, borderRadius: 8, cursor: "pointer", background: active ? "rgba(245,197,24,0.15)" : "#161616", border: `1px solid ${active ? "#F5C518" : "#2A2A2A"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{t.name}</p>
                  {recommended && <span style={{ fontSize: 9, background: "#F5C518", color: "#111", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>EMPFOHLEN</span>}
                </div>
                <p style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{t.desc}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {cardioPlans.length > 1 && (
        <Card style={{ marginBottom: 12 }}>
          <Muted>Gespeicherte Pläne</Muted>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>{cardioPlans.map(p => <button key={p.id} onClick={() => setActiveCardioPlan(p.id)} style={{ padding: "6px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", background: p.id === activeCardioPlanId ? "#F5C518" : "#161616", color: p.id === activeCardioPlanId ? "#111" : "#fff", border: "1px solid #2A2A2A" }}>{p.name}</button>)}</div>
        </Card>
      )}

      {activePlan ? (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "#fff", fontWeight: 700 }}>{activePlan.name}</p>
              {activePlan.targetPace && <p style={{ color: "#F5C518", fontSize: 13, marginTop: 4 }}>🎯 {activePlan.distance} in ca. {activePlan.targetPace} min/km {activePlan.adjustSec ? <span style={{ color: "#888", fontSize: 10 }}>(automatisch angepasst)</span> : null}</p>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {activePlan.type === "suggested" && <button onClick={() => selectPlanType(activePlan.planTypeId || recPlanTypeId)} style={{ background: "none", border: "1px solid #2A2A2A", borderRadius: 6, padding: 6, cursor: "pointer" }}><RefreshCw size={13} color="#F5C518" /></button>}
              <button onClick={() => deleteCardioPlan(activePlan.id)} style={{ background: "none", border: "1px solid #2A2A2A", borderRadius: 6, padding: 6, cursor: "pointer" }}><Trash2 size={13} color="#FF5555" /></button>
            </div>
          </div>
          {activePlan.tip && <p style={{ fontSize: 11, color: "#888", marginTop: 8, lineHeight: 1.5 }}>{activePlan.tip}</p>}
          <div style={{ height: 6, background: "#2A2A2A", borderRadius: 3, marginTop: 10 }}><div style={{ height: "100%", background: "#F5C518", borderRadius: 3, width: `${Math.min(100, (weekRuns / (activePlan.perWeek || 3)) * 100)}%` }} /></div>
          <p style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{weekRuns}/{activePlan.perWeek} diese Woche</p>

          <Muted style={{ display: "block", marginTop: 12 }}>Nächste Tage · antippen für Details</Muted>
          {upcoming.map((day, i) => (
            day.session ? (
              <button key={i} onClick={() => setSessionDetail(day)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "8px 0", borderBottom: "1px solid #222", background: "none", border: "none", borderBottomStyle: "solid", cursor: "pointer", textAlign: "left" }}>
                <span style={{ color: "#fff", fontSize: 12, width: 70 }}>{day.weekday} {day.date === todayStr() ? "(Heute)" : ""}</span>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <p style={{ color: "#F5C518", fontSize: 12 }}>{day.session.title}</p>
                  <p style={{ color: "#888", fontSize: 11 }}>{day.session.desc}</p>
                </div>
                <ChevronRight size={14} color="#666" style={{ marginLeft: 6, flexShrink: 0 }} />
              </button>
            ) : (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #222" }}>
                <span style={{ color: "#fff", fontSize: 12, width: 70 }}>{day.weekday} {day.date === todayStr() ? "(Heute)" : ""}</span>
                <span style={{ color: "#555", fontSize: 12 }}>Ruhetag</span>
              </div>
            )
          ))}
        </Card>
      ) : <Card style={{ marginBottom: 12 }}><Muted>Kein aktiver Plan.</Muted></Card>}

      <Card style={{ marginBottom: 12 }}>
        {isPremium ? <PrimaryBtn style={{ width: "100%" }} onClick={() => setBuilderOpen(true)}>+ Eigenen Cardio-Plan erstellen</PrimaryBtn>
          : <button onClick={() => setShowPremium(true)} style={{ ...smallBtn }}>🔒 Eigenen Plan erstellen (Premium)</button>}
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Muted>Einheit eintragen</Muted>
        <select value={f.type} onChange={e => setF(s => ({ ...s, type: e.target.value }))} style={inputStyle}><option>Laufen</option><option>Rad</option><option>Schwimmen</option></select>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
          <input type="number" step="0.1" placeholder="km" value={f.distance} onChange={e => setF(s => ({ ...s, distance: e.target.value }))} style={inputStyle} />
          <input type="number" placeholder="Min" value={f.duration} onChange={e => setF(s => ({ ...s, duration: e.target.value }))} style={inputStyle} />
        </div>
        <PrimaryBtn style={{ width: "100%", marginTop: 8 }} onClick={() => { if (f.distance && f.duration) { addCardio({ ...f, date: todayStr() }); setF({ type: "Laufen", distance: "", duration: "" }); } }}>Speichern</PrimaryBtn>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Muted>📸 Foto-Tagebuch nach dem Lauf {!isPremium && <ProLock />}</Muted>
          {isPremium && runPhotos.length > 0 && <button onClick={() => setPhotoView(true)} style={{ fontSize: 10, background: "none", border: "1px solid #2A2A2A", borderRadius: 4, padding: "3px 8px", color: "#F5C518", cursor: "pointer" }}>Alle ansehen ({runPhotos.length})</button>}
        </div>
        {isPremium ? (
          <>
            <p style={{ fontSize: 11, color: "#888", marginTop: 6 }}>Mach nach jedem Lauf ein Foto — so siehst du nach Monaten, wie viel frischer du aussiehst.</p>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8, padding: 12, borderRadius: 8, background: "#161616", border: "1px dashed #F5C518", cursor: "pointer" }}>
              {uploadingPhoto ? <Loader2 size={16} color="#F5C518" className="spin" /> : <Camera size={16} color="#F5C518" />}
              <span style={{ fontSize: 12, color: "#F5C518" }}>{uploadingPhoto ? "Speichere…" : "Foto von heute aufnehmen"}</span>
              <input type="file" accept="image/*" capture="user" style={{ display: "none" }} onChange={handlePhotoUpload} disabled={uploadingPhoto} />
            </label>
            {todayPhotos.length > 0 && (
              <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
                {todayPhotos.map((p, i) => <img key={i} src={p.img} alt="Heute" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />)}
              </div>
            )}
          </>
        ) : (
          <button onClick={() => setShowPremium(true)} style={{ width: "100%", marginTop: 8, padding: 20, borderRadius: 10, background: "#161616", border: "1px dashed #444", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <Lock size={20} color="#F5C518" />
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Foto-Tagebuch freischalten</span>
            <span style={{ fontSize: 10, color: "#888", textAlign: "center" }}>Täglich ein Foto nach dem Lauf — vergleiche dich mit letzter Woche oder letztem Jahr</span>
          </button>
        )}
      </Card>

      <Card>
        <Muted>Verlauf & Feedback</Muted>
        {[...cardioLog].reverse().slice(0, 8).map((c, i) => {
          const realIdx = cardioLog.length - 1 - i;
          return (
          <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #2A2A2A" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span style={{ color: "#fff" }}>{c.type} · {fmtDate(c.date)}</span><span style={{ color: "#888" }}>{c.distance}km · {c.duration}min</span></div>
            {!c.feedback && (
              <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                {["zu leicht", "passend", "zu anstrengend"].map(fb => <button key={fb} onClick={() => handleFeedback(realIdx, fb)} style={{ fontSize: 10, padding: "4px 6px", background: "#161616", border: "1px solid #2A2A2A", borderRadius: 4, color: "#aaa", cursor: "pointer" }}>{fb}</button>)}
              </div>
            )}
            {c.feedback && <p style={{ fontSize: 11, color: "#F5C518", marginTop: 4 }}>Bewertet: {c.feedback}</p>}
          </div>
          );
        })}
        {cardioLog.length === 0 && <p style={{ fontSize: 12, color: "#666" }}>Noch keine Einträge</p>}
      </Card>
    </div>
  );
}

// ===== ROUTEN-BERECHNUNG =====
// Erzeugt echte Rundkurse: Wegpunkte auf einem Kreis um den Start, Google Maps routet drumherum zurück
function destPoint(lat, lng, bearingDeg, distKm) {
  const R = 6371, br = bearingDeg * Math.PI / 180, la = lat * Math.PI / 180, lo = lng * Math.PI / 180;
  const la2 = Math.asin(Math.sin(la) * Math.cos(distKm / R) + Math.cos(la) * Math.sin(distKm / R) * Math.cos(br));
  const lo2 = lo + Math.atan2(Math.sin(br) * Math.sin(distKm / R) * Math.cos(la), Math.cos(distKm / R) - Math.sin(la) * Math.sin(la2));
  return { lat: la2 * 180 / Math.PI, lng: ((lo2 * 180 / Math.PI) + 540) % 360 - 180 };
}
// Straßen sind länger als Luftlinie → Korrekturfaktor
const ROAD_FACTOR = 0.78;
function buildLoopRoutes(origin, targetKm) {
  const shapes = [
    { name: "Dreieck Nord", points: 3, start: 0, perim: 3 * Math.sqrt(3) },
    { name: "Dreieck Süd", points: 3, start: 180, perim: 3 * Math.sqrt(3) },
    { name: "Viereck Ost", points: 4, start: 45, perim: 4 * Math.sqrt(2) },
    { name: "Viereck West", points: 4, start: 225, perim: 4 * Math.sqrt(2) },
    { name: "Hin & Zurück", points: 1, start: 90, perim: 2 },
  ];
  return shapes.map(sh => {
    const radius = (targetKm * ROAD_FACTOR) / sh.perim;
    const wps = [];
    for (let i = 0; i < sh.points; i++) {
      const bearing = (sh.start + (360 / sh.points) * i) % 360;
      const p = destPoint(origin.lat, origin.lng, bearing, sh.points === 1 ? targetKm * ROAD_FACTOR / 2 : radius);
      wps.push(p);
    }
    const o = `${origin.lat.toFixed(6)},${origin.lng.toFixed(6)}`;
    const wpStr = wps.map(p => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join("|");
    const url = `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${o}&waypoints=${encodeURIComponent(wpStr)}&travelmode=walking`;
    return { name: sh.name, url, waypoints: wps.length, radius: radius.toFixed(2) };
  });
}
function komootUrl(origin, km) { return `https://www.komoot.com/plan/@${origin.lat},${origin.lng},13z?sport=jogging`; }

function SessionDetail({ day, plan, onClose, onFeedback, adaptNote, homeAddress, onSaveHome, isPremium, setShowPremium }) {
  const [loc, setLoc] = useState(null);
  const [locState, setLocState] = useState("idle");
  const [locName, setLocName] = useState("");
  const [homeInput, setHomeInput] = useState(homeAddress || "");
  const [editingHome, setEditingHome] = useState(!homeAddress);
  const [homeCoords, setHomeCoords] = useState(null);
  const [homeGeoState, setHomeGeoState] = useState("idle");
  const [startMode, setStartMode] = useState(homeAddress ? "home" : "current");

  const s = day.session;
  const dist = s.distance || 5;
  const paceStr = s.pace || plan.targetPace || "6:00";
  const totalMin = Math.round(dist * paceToSec(paceStr) / 60);
  const elevation = s.title === "Long Run" ? Math.round(dist * 12) : s.title === "Intervalle" ? Math.round(dist * 3) : Math.round(dist * 8);
  const typeHint = {
    "Locker": "Ruhiges Tempo — du solltest dich dabei noch unterhalten können. Ziel ist Erholung und Grundlagenausdauer.",
    "Long Run": "Der wichtigste Lauf der Woche. Gleichmäßig und bewusst langsam — die Distanz zählt, nicht das Tempo.",
    "Tempolauf": "Zügig und gleichmäßig, knapp unter deinem Wettkampftempo. Fordernd, aber kontrolliert.",
    "Intervalle": "Wechsel zwischen schnellen Abschnitten und lockerem Traben. Nach dem Aufwärmen starten, danach auslaufen.",
  }[s.title] || "";

  const askLocation = () => {
    setLocState("loading");
    if (!navigator.geolocation) { setLocState("unsupported"); return; }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: Math.round(pos.coords.accuracy) };
        setLoc(p); setLocState("ok");
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.lat}&lon=${p.lng}&zoom=16`);
          const j = await r.json();
          if (j.display_name) setLocName(j.display_name.split(",").slice(0, 3).join(",").trim());
        } catch { /* optional */ }
      },
      err => setLocState(err.code === 1 ? "denied" : "failed"),
      { timeout: 20000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const geocodeHome = async (addr) => {
    setHomeGeoState("loading");
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addr)}`);
      const j = await r.json();
      if (j && j[0]) { setHomeCoords({ lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) }); setHomeGeoState("ok"); }
      else setHomeGeoState("notfound");
    } catch { setHomeGeoState("blocked"); }
  };
  useEffect(() => { if (homeAddress) geocodeHome(homeAddress); }, [homeAddress]); // eslint-disable-line

  const routeOrigin = startMode === "home" ? homeCoords : (locState === "ok" ? loc : null);
  const loopRoutes = useMemo(() => routeOrigin ? buildLoopRoutes(routeOrigin, dist) : [], [routeOrigin, dist]);
  // Fallback: ohne Koordinaten trotzdem Routen über die Adresse als Text
  const addressFallback = startMode === "home" && homeAddress && !homeCoords;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1200, overflow: "auto", padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 440, margin: "0 auto" }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <Muted>{day.weekday}{day.date === todayStr() ? " · Heute" : ""}</Muted>
              <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, marginTop: 4 }}>{s.title}</h2>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color="#888" /></button>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
            {[[dist, "Kilometer"], [paceStr, "min/km"], [totalMin, "Min ca."], [elevation, "Höhenm."]].map(([v, l], i) => (
              <div key={i} style={{ flex: 1, background: "#0D0D0D", borderRadius: 10, padding: 10, textAlign: "center" }}>
                <p style={{ color: "#F5C518", fontSize: 20, fontWeight: 800 }}>{v}</p>
                <p style={{ fontSize: 9, color: "#888" }}>{l}</p>
              </div>
            ))}
          </div>
          {typeHint && <p style={{ fontSize: 12, color: "#aaa", marginTop: 12, lineHeight: 1.5 }}>💡 {typeHint}</p>}
        </Card>

        {/* ROUTE */}
        <Card style={{ marginTop: 12 }}>
          <Muted>🗺️ Rundstrecke für heute {!isPremium && <ProLock />}</Muted>
          <p style={{ fontSize: 11, color: "#888", marginTop: 6, lineHeight: 1.5 }}>Ziel: <b style={{ color: "#F5C518" }}>{dist} km</b> · ca. {elevation} Hm · Start = Ziel</p>

          {!isPremium ? (
            <button onClick={() => setShowPremium(true)} style={{ width: "100%", marginTop: 10, padding: 20, borderRadius: 10, background: "#161616", border: "1px dashed #444", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <Lock size={20} color="#F5C518" />
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Routenplaner freischalten</span>
              <span style={{ fontSize: 10, color: "#888", textAlign: "center" }}>Mehrere Rundkurse passend zu deiner Tagesdistanz — direkt navigierbar</span>
            </button>
          ) : (
            <>
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <button onClick={() => setStartMode("home")} style={{ flex: 1, padding: 8, borderRadius: 8, fontSize: 11, cursor: "pointer", background: startMode === "home" ? "#F5C518" : "#161616", color: startMode === "home" ? "#111" : "#aaa", border: "1px solid #2A2A2A" }}>🏠 Adresse</button>
                <button onClick={() => { setStartMode("current"); if (locState === "idle") askLocation(); }} style={{ flex: 1, padding: 8, borderRadius: 8, fontSize: 11, cursor: "pointer", background: startMode === "current" ? "#F5C518" : "#161616", color: startMode === "current" ? "#111" : "#aaa", border: "1px solid #2A2A2A" }}>🧭 Standort</button>
              </div>

              {startMode === "home" && (
                <div style={{ marginTop: 10, padding: 10, background: "#0D0D0D", borderRadius: 8 }}>
                  {homeAddress && !editingHome ? (
                    <>
                      <p style={{ color: "#fff", fontSize: 12 }}>{homeAddress}</p>
                      {homeGeoState === "loading" && <p style={{ fontSize: 10, color: "#888", marginTop: 4 }}>Position wird gesucht…</p>}
                      {homeGeoState === "ok" && <p style={{ fontSize: 10, color: "#7CFC00", marginTop: 4 }}>✓ Position gefunden — Rundkurse unten</p>}
                      {homeGeoState === "notfound" && <p style={{ fontSize: 10, color: "#FF8855", marginTop: 4 }}>Nicht gefunden. Bitte genauer: Strasse Nr., PLZ Ort</p>}
                      {homeGeoState === "blocked" && <p style={{ fontSize: 10, color: "#FF8855", marginTop: 4 }}>Adress-Suche blockiert — du bekommst unten trotzdem Routen über Google Maps.</p>}
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button onClick={() => setEditingHome(true)} style={{ ...smallBtn, background: "#333", color: "#fff", flex: 1 }}>Ändern</button>
                        {homeGeoState !== "ok" && <button onClick={() => geocodeHome(homeAddress)} style={{ ...smallBtn, flex: 1 }}>Nochmal suchen</button>}
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>Startadresse (z.B. Bahnhofstrasse 1, 8001 Zürich)</p>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input value={homeInput} onChange={e => setHomeInput(e.target.value)} placeholder="Strasse Nr., PLZ Ort" style={{ ...inputStyle, marginTop: 0, flex: 1 }} />
                        <button onClick={() => { if (homeInput.trim()) { onSaveHome(homeInput.trim()); setEditingHome(false); } }} style={{ ...smallBtn, width: "auto", padding: "9px 12px" }}>OK</button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {startMode === "current" && (
                <div style={{ marginTop: 10, padding: 10, background: "#0D0D0D", borderRadius: 8 }}>
                  {locState === "idle" && <><p style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>Erlaube den Zugriff, damit Rundkurse ab deiner aktuellen Position berechnet werden.</p><button onClick={askLocation} style={smallBtn}>Standort ermitteln</button></>}
                  {locState === "loading" && <p style={{ fontSize: 11, color: "#888" }}>📡 GPS wird abgefragt… (bis zu 20 Sek.)</p>}
                  {locState === "ok" && loc && (<>
                    <p style={{ fontSize: 11, color: "#7CFC00" }}>✓ Standort gefunden{loc.acc ? ` (±${loc.acc} m)` : ""}</p>
                    {locName && <p style={{ fontSize: 11, color: "#fff", marginTop: 3 }}>{locName}</p>}
                    <button onClick={askLocation} style={{ ...smallBtn, background: "#333", color: "#fff", marginTop: 8 }}>Aktualisieren</button>
                  </>)}
                  {(locState === "denied" || locState === "failed" || locState === "unsupported") && (<>
                    <p style={{ fontSize: 11, color: "#FF8855", lineHeight: 1.4 }}>
                      {locState === "denied" ? "Standort wurde blockiert. In dieser Vorschau ist das oft der Fall — auf der fertigen Webseite funktioniert es. Alternativ oben auf „Adresse\" wechseln." : locState === "unsupported" ? "Browser unterstützt keine Standortabfrage — nutze oben „Adresse\"." : "GPS-Signal nicht ermittelbar."}
                    </p>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <button onClick={askLocation} style={{ ...smallBtn, background: "#333", color: "#fff", flex: 1 }}>Nochmal</button>
                      <button onClick={() => setStartMode("home")} style={{ ...smallBtn, flex: 1 }}>Adresse nutzen</button>
                    </div>
                  </>)}
                </div>
              )}

              {/* ROUTENVORSCHLÄGE */}
              {routeOrigin && loopRoutes.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <Muted style={{ fontSize: 10 }}>{loopRoutes.length} Rundkurse à ca. {dist} km — enden wieder am Start</Muted>
                  {loopRoutes.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 10, marginTop: 6, background: "#161616", border: "1px solid #2A2A2A", borderRadius: 8, textDecoration: "none" }}>
                      <div><p style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{r.name}</p><p style={{ color: "#888", fontSize: 10 }}>{r.waypoints} Wegpunkt(e) · Rundkurs</p></div>
                      <span style={{ color: "#F5C518", fontSize: 11 }}>Navigieren →</span>
                    </a>
                  ))}
                  <a href={komootUrl(routeOrigin, dist)} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", padding: 10, marginTop: 8, background: "#0D0D0D", border: "1px solid #2A2A2A", borderRadius: 8, color: "#aaa", fontSize: 11, textDecoration: "none" }}>In Komoot öffnen (Höhenprofil & Trails)</a>
                  <p style={{ fontSize: 10, color: "#666", marginTop: 8, lineHeight: 1.4 }}>Länge kann je nach Straßenverlauf um ±15% abweichen — in Google Maps siehst du die exakte km-Zahl.</p>
                </div>
              )}

              {/* FALLBACK ohne Koordinaten */}
              {addressFallback && (
                <div style={{ marginTop: 12 }}>
                  <Muted style={{ fontSize: 10 }}>Routen über deine Adresse</Muted>
                  <a href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(homeAddress)}&destination=${encodeURIComponent(homeAddress)}&travelmode=walking`} target="_blank" rel="noopener noreferrer" style={{ ...smallBtn, display: "block", textAlign: "center", textDecoration: "none", marginTop: 6, padding: "10px 0" }}>Rundkurs ab Adresse planen</a>
                  <a href={`https://www.google.com/maps/search/Laufstrecke+${encodeURIComponent(homeAddress)}`} target="_blank" rel="noopener noreferrer" style={{ ...smallBtn, background: "#333", color: "#fff", display: "block", textAlign: "center", textDecoration: "none", marginTop: 6, padding: "10px 0" }}>Laufstrecken in der Nähe suchen</a>
                  <a href={`https://www.komoot.com/discover/${encodeURIComponent(homeAddress)}/@/sport/jogging`} target="_blank" rel="noopener noreferrer" style={{ ...smallBtn, background: "#333", color: "#fff", display: "block", textAlign: "center", textDecoration: "none", marginTop: 6, padding: "10px 0" }}>Komoot-Routen entdecken</a>
                  <p style={{ fontSize: 10, color: "#666", marginTop: 8 }}>Setze in Google Maps Zwischenziele, bis du auf {dist} km kommst.</p>
                </div>
              )}

              {!routeOrigin && !addressFallback && (
                <p style={{ fontSize: 11, color: "#666", marginTop: 12, textAlign: "center" }}>Wähle oben einen Startpunkt, um Rundkurse zu erhalten.</p>
              )}
            </>
          )}
        </Card>

        {/* FEEDBACK */}
        <Card style={{ marginTop: 12 }}>
          <Muted>Wie war die Einheit?</Muted>
          <p style={{ fontSize: 11, color: "#888", marginTop: 4 }}>Dein Feedback passt die kommenden Einheiten sofort an.</p>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {[["zu leicht", "😌"], ["passend", "👍"], ["zu anstrengend", "🥵"]].map(([fb, emoji]) => (
              <button key={fb} onClick={() => onFeedback(fb, dist, totalMin)} style={{ flex: 1, padding: "10px 4px", borderRadius: 8, background: "#161616", border: "1px solid #2A2A2A", color: "#fff", cursor: "pointer", fontSize: 11 }}>
                <div style={{ fontSize: 18 }}>{emoji}</div>{fb}
              </button>
            ))}
          </div>
          {adaptNote && <p style={{ fontSize: 11, color: "#F5C518", marginTop: 10, lineHeight: 1.5 }}>🔄 {adaptNote}</p>}
        </Card>
      </div>
    </div>
  );
}

function PhotoDiary({ photos, onClose, onDelete }) {
  const [selected, setSelected] = useState(null);
  const sorted = [...photos].sort((a, b) => b.time - a.time);
  const byDate = sorted.reduce((acc, p) => { (acc[p.date] = acc[p.date] || []).push(p); return acc; }, {});
  const dates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a));
  const oldest = sorted[sorted.length - 1];
  const newest = sorted[0];

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0D0D0D", zIndex: 1200, overflow: "auto" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button onClick={() => selected ? setSelected(null) : onClose()} style={iconBtn}><ChevronLeft size={18} color="#fff" /></button>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>📸 Foto-Tagebuch</p>
        </div>

        {selected ? (
          <Card>
            <img src={selected.img} alt="" style={{ width: "100%", borderRadius: 10 }} />
            <p style={{ color: "#fff", fontSize: 13, marginTop: 8 }}>{fmtDate(selected.date)}</p>
            <p style={{ fontSize: 11, color: "#888" }}>vor {daysAgo(selected.date)} Tagen</p>
            <button onClick={() => { onDelete(selected.time); setSelected(null); }} style={{ ...smallBtn, background: "#333", color: "#FF5555", marginTop: 10 }}>Foto löschen</button>
          </Card>
        ) : (
          <>
            {sorted.length >= 2 && oldest.time !== newest.time && (
              <Card style={{ marginBottom: 12 }}>
                <Muted>Direkter Vergleich</Muted>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <div style={{ flex: 1 }}>
                    <img src={oldest.img} alt="" style={{ width: "100%", borderRadius: 8 }} />
                    <p style={{ fontSize: 10, color: "#888", marginTop: 4, textAlign: "center" }}>Damals · {fmtDate(oldest.date)}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <img src={newest.img} alt="" style={{ width: "100%", borderRadius: 8 }} />
                    <p style={{ fontSize: 10, color: "#F5C518", marginTop: 4, textAlign: "center" }}>Jetzt · {fmtDate(newest.date)}</p>
                  </div>
                </div>
                <p style={{ fontSize: 10, color: "#666", marginTop: 8, textAlign: "center" }}>{daysAgo(oldest.date)} Tage Unterschied</p>
              </Card>
            )}
            {dates.map(date => (
              <Card key={date} style={{ marginBottom: 10 }}>
                <Muted>{fmtDate(date)} {date === todayStr() ? "· Heute" : `· vor ${daysAgo(date)} Tagen`}</Muted>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {byDate[date].map((p, i) => (
                    <button key={i} onClick={() => setSelected(p)} style={{ padding: 0, border: "none", background: "none", cursor: "pointer" }}>
                      <img src={p.img} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                    </button>
                  ))}
                </div>
              </Card>
            ))}
            {sorted.length === 0 && <Card><p style={{ fontSize: 12, color: "#666" }}>Noch keine Fotos. Mach nach deinem nächsten Lauf eins!</p></Card>}
          </>
        )}
      </div>
    </div>
  );
}

function CardioPlanBuilder({ onClose, onSave, runGoal }) {
  const [name, setName] = useState("Mein Cardio-Plan");
  const [perWeek, setPerWeek] = useState(3);
  const [sessions, setSessions] = useState([{ title: "Locker", distance: 5, pace: "6:00" }]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1100, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1A1A1A", width: "100%", maxHeight: "85vh", borderRadius: "18px 18px 0 0", padding: 16, overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><p style={{ color: "#fff", fontWeight: 700 }}>Eigenen Cardio-Plan</p><button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color="#888" /></button></div>
        {CARDIO_TIPS[runGoal] && <div style={{ background: "rgba(245,197,24,0.1)", padding: 10, borderRadius: 8, margin: "10px 0", fontSize: 11, color: "#F5C518", lineHeight: 1.5 }}>💡 {CARDIO_TIPS[runGoal]}</div>}
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Plan-Name" style={inputStyle} />
        <label style={{ fontSize: 12, color: "#fff" }}>Einheiten pro Woche<input type="number" value={perWeek} onChange={e => setPerWeek(Number(e.target.value))} style={inputStyle} /></label>
        {sessions.map((s, i) => (
          <div key={i} style={{ marginTop: 8, padding: 8, background: "#0D0D0D", borderRadius: 8 }}>
            <input value={s.title} onChange={e => setSessions(ss => ss.map((x, xi) => xi === i ? { ...x, title: e.target.value } : x))} placeholder="Titel (z.B. Locker, Intervalle)" style={{ ...inputStyle, marginTop: 0 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
              <input type="number" step="0.5" value={s.distance || ""} onChange={e => setSessions(ss => ss.map((x, xi) => xi === i ? { ...x, distance: e.target.value } : x))} placeholder="km" style={{ ...inputStyle, marginTop: 0 }} />
              <input value={s.pace || ""} onChange={e => setSessions(ss => ss.map((x, xi) => xi === i ? { ...x, pace: e.target.value } : x))} placeholder="Pace z.B. 5:30" style={{ ...inputStyle, marginTop: 0 }} />
            </div>
            <p style={{ fontSize: 10, color: "#666", marginTop: 4 }}>Mit km-Angabe bekommst du für diese Einheit passende Rundstrecken vorgeschlagen.</p>
          </div>
        ))}
        <button onClick={() => setSessions(ss => [...ss, { title: "", distance: 5, pace: "6:00" }])} style={{ ...smallBtn, background: "#333", color: "#fff", marginTop: 8 }}>+ Einheit hinzufügen</button>
        <PrimaryBtn style={{ width: "100%", marginTop: 12 }} onClick={() => { const days = Array.from({ length: perWeek }, (_, i) => Math.round(i * 7 / perWeek)); onSave({ id: "cardio-custom-" + Date.now(), name, type: "custom", perWeek, targetPace: sessions[0]?.pace || "6:00", distance: `${sessions[0]?.distance || 5} km`, schedule: sessions.map((s, i) => ({ weekday: days[i] || 0, title: s.title, desc: `${s.distance || 5} km bei ca. ${s.pace || "6:00"} min/km`, distance: Number(s.distance) || 5, pace: s.pace || "6:00" })) }); }}><Save size={14} style={{ display: "inline", marginRight: 6 }} />Plan speichern</PrimaryBtn>
      </div>
    </div>
  );
}

// ================= PREMIUM MODAL =================
function PremiumModal({ onClose, onUpgrade }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <Card style={{ maxWidth: 360 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><h3 style={{ color: "#fff", fontSize: 18, display: "flex", alignItems: "center", gap: 6 }}><Lock size={18} color="#F5C518" /> Premium</h3><button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color="#888" /></button></div>
        <p style={{ color: "#aaa", fontSize: 13, marginTop: 8 }}>Schalte Videos, Strichcode-Suche, Routenplaner, eigene Pläne & alle Auswertungen frei.</p>
        <div style={{ background: "rgba(245,197,24,0.1)", padding: 10, borderRadius: 8, marginTop: 10 }}><p style={{ color: "#F5C518", fontWeight: 700, fontSize: 13 }}>CHF 4.99/Monat · CHF 39.99/Jahr</p></div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}><button onClick={onClose} style={{ ...smallBtn, background: "#333", color: "#fff", flex: 1 }}>Später</button><button onClick={onUpgrade} style={{ ...smallBtn, flex: 1 }}>Upgrade</button></div>
      </Card>
    </div>
  );
}

function PersonalTipsPage({ onBack }) {
  const [category, setCategory] = useState(null);
  const categories = [
    { id: "ernaehrung", label: "Ernährung", emoji: "🥗" },
    { id: "kraft", label: "Kraft", emoji: "💪" },
    { id: "ausdauer", label: "Ausdauer", emoji: "🏃" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0D0D0D", zIndex: 1200, overflow: "auto" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button onClick={() => category ? setCategory(null) : onBack()} style={iconBtn}><ChevronLeft size={18} color="#fff" /></button>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Persönliche Informationen</p>
        </div>
        {!category ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Muted>Tipps direkt von der Person hinter dieser App — aus eigener Gym- und Ernährungserfahrung.</Muted>
            {categories.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 12, cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 24 }}>{c.emoji}</span>
                <span style={{ color: "#fff", fontWeight: 600, flex: 1 }}>{c.label}</span>
                <ChevronRight size={18} color="#666" />
              </button>
            ))}
          </div>
        ) : (
          <Card>
            <p style={{ color: "#F5C518", fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{categories.find(c => c.id === category)?.emoji} {categories.find(c => c.id === category)?.label}</p>
            <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.6 }}>Tipps, welche sie mir noch nicht gegeben haben.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function QuickAdd({ onClose, onWater, gotoTraining, gotoFood, gotoCardio }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1A1A1A", width: "100%", borderRadius: "18px 18px 0 0", padding: 20 }}>
        <p style={{ color: "#fff", fontWeight: 700, marginBottom: 12 }}>Schnell hinzufügen</p>
        {[["💧 Wasser (+250ml)", () => { onWater(250); onClose(); }], ["🍽️ Essen eintragen", () => { gotoFood(); onClose(); }], ["🏋️ Training eintragen", () => { gotoTraining(); onClose(); }], ["🏃 Cardio eintragen", () => { gotoCardio(); onClose(); }]].map(([label, fn]) => (
          <button key={label} onClick={fn} style={{ width: "100%", textAlign: "left", padding: 14, background: "#0D0D0D", border: "1px solid #2A2A2A", borderRadius: 10, color: "#fff", marginBottom: 8, cursor: "pointer", fontSize: 14 }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

// ================= MAIN APP =================
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("home");
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showPremium, setShowPremium] = useState(false);
  const [showTipsPage, setShowTipsPage] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [weightLog, setWeightLog] = useState([]);
  const [waterLog, setWaterLog] = useState([]);
  const [mealLog, setMealLog] = useState([]);
  const [workoutLog, setWorkoutLog] = useState([]);
  const [cardioLog, setCardioLog] = useState([]);
  const [customFoods, setCustomFoods] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [planOverrides, setPlanOverrides] = useState({});
  const [runPhotos, setRunPhotos] = useState([]);
  const [dayRatings, setDayRatings] = useState({});
  const [homeAddress, setHomeAddressState] = useState("");
  const [offerSeen, setOfferSeen] = useState(true);
  const [plans, setPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [cardioPlans, setCardioPlans] = useState([]);
  const [activeCardioPlanId, setActiveCardioPlanId] = useState(null);

  // 1. Session prüfen
  useEffect(() => { (async () => {
    const sessionId = await loadGlobal("session", null);
    if (sessionId) {
      const users = await loadGlobal("users", []);
      const u = users.find(x => x.id === sessionId);
      if (u) { setStorageUser(u.id); setAuthUser(u); }
    }
    setAuthChecked(true);
  })(); }, []);

  // 2. Nutzerdaten laden, sobald angemeldet
  useEffect(() => { if (!authUser) return; (async () => {
    setLoaded(false);
    const [p, w, wa, m, wo, c, cf, prem, pl, apid, cpl, acpid, sr, po, rp, dr, os, ha] = await Promise.all([
      loadKey("profile", null), loadKey("weight-log", []), loadKey("water-log", []), loadKey("meal-log", []),
      loadKey("workout-log", []), loadKey("cardio-log", []), loadKey("custom-foods", []), loadKey("premium", false),
      loadKey("plans", []), loadKey("active-plan-id", null), loadKey("cardio-plans", []), loadKey("active-cardio-plan-id", null),
      loadKey("saved-recipes", []), loadKey("plan-overrides", {}), loadKey("run-photos", []),
      loadKey("day-ratings", {}), loadKey("offer-seen", false), loadKey("home-address", ""),
    ]);
    setProfile(p); setWeightLog(w); setWaterLog(wa); setMealLog(m); setWorkoutLog(wo); setCardioLog(c); setCustomFoods(cf); setIsPremium(prem);
    setPlans(pl); setActivePlanId(apid); setCardioPlans(cpl); setActiveCardioPlanId(acpid);
    setSavedRecipes(sr); setPlanOverrides(po); setRunPhotos(rp); setDayRatings(dr); setOfferSeen(os); setHomeAddressState(ha);
    setLoaded(true);
  })(); }, [authUser]);

  const handleLogin = (user) => { setStorageUser(user.id); setAuthUser(user); };
  const handleLogout = async () => {
    await saveGlobal("session", null);
    setStorageUser(null); setAuthUser(null); setProfile(null); setLoaded(false);
    setWeightLog([]); setWaterLog([]); setMealLog([]); setWorkoutLog([]); setCardioLog([]);
    setPlans([]); setCardioPlans([]); setSavedRecipes([]); setRunPhotos([]); setIsPremium(false); setOfferSeen(false);
  };

  const targets = useMemo(() => profile && calcTargets(profile), [profile]);
  const saveProfile = async (p) => { setProfile(p); await saveKey("profile", p); };
  const addWeight = async (val) => { const next = [...weightLog, { date: todayStr(), time: Date.now(), weight: val }]; setWeightLog(next); await saveKey("weight-log", next); };
  const addWater = async (ml) => {
    const today = todayStr();
    const currentTotal = waterLog.filter(w => w.date === today).reduce((s, w) => s + w.amount, 0);
    const applied = ml < 0 ? -Math.min(-ml, currentTotal) : ml;
    if (applied === 0) return;
    const next = [...waterLog, { date: today, amount: applied }];
    setWaterLog(next); await saveKey("water-log", next);
  };
  const addMeal = async (f) => { const next = [...mealLog, { date: selectedDate, name: f.name, kcal: Number(f.kcal) || 0, protein: Number(f.protein) || 0, carbs: Number(f.carbs) || 0, fat: Number(f.fat) || 0, fiber: Number(f.fiber) || 0 }]; setMealLog(next); await saveKey("meal-log", next); };
  const addWorkout = async (e) => { const next = [...workoutLog, e]; setWorkoutLog(next); await saveKey("workout-log", next); };
  const addCardio = async (e) => { const next = [...cardioLog, e]; setCardioLog(next); await saveKey("cardio-log", next); };
  const setCardioFeedback = async (idx, fb) => { const next = cardioLog.map((c, i) => i === idx ? { ...c, feedback: fb } : c); setCardioLog(next); await saveKey("cardio-log", next); };
  const addCustomFood = async (f) => { const next = [...customFoods, f]; setCustomFoods(next); await saveKey("custom-foods", next); };
  const addSavedRecipe = async (id) => { if (savedRecipes.includes(id)) return; const next = [...savedRecipes, id]; setSavedRecipes(next); await saveKey("saved-recipes", next); };
  const removeSavedRecipe = async (id) => { const next = savedRecipes.filter(x => x !== id); setSavedRecipes(next); await saveKey("saved-recipes", next); };
  const setPlanOverride = async (meal, recipeId) => { const next = { ...planOverrides }; if (recipeId) next[meal] = recipeId; else delete next[meal]; setPlanOverrides(next); await saveKey("plan-overrides", next); };
  const addRunPhoto = async (photo) => {
    const next = [...runPhotos, photo].slice(-60); // max 60 Fotos, damit der Speicher nicht überläuft
    setRunPhotos(next); await saveKey("run-photos", next);
  };
  const setDayRating = async (key, rating) => { const next = { ...dayRatings, [key]: rating }; setDayRatings(next); await saveKey("day-ratings", next); };
  const setHomeAddress = async (addr) => { setHomeAddressState(addr); await saveKey("home-address", addr); };
  const dismissOffer = async () => { setOfferSeen(true); await saveKey("offer-seen", true); };
  const deleteRunPhoto = async (time) => { const next = runPhotos.filter(p => p.time !== time); setRunPhotos(next); await saveKey("run-photos", next); };

  const savePlan = async (plan, replaceSuggested) => {
    let next;
    if (replaceSuggested) next = [...plans.filter(p => p.type !== "suggested"), plan];
    else next = plans.some(p => p.id === plan.id) ? plans.map(p => p.id === plan.id ? plan : p) : [...plans, plan];
    setPlans(next); await saveKey("plans", next);
    setActivePlanId(plan.id); await saveKey("active-plan-id", plan.id);
  };
  const setActivePlan = async (id) => { setActivePlanId(id); await saveKey("active-plan-id", id); };
  const deletePlan = async (id) => {
    const next = plans.filter(p => p.id !== id); setPlans(next); await saveKey("plans", next);
    const newActive = next[0]?.id || null; setActivePlanId(newActive); await saveKey("active-plan-id", newActive);
  };

  const saveCardioPlan = async (plan, replaceSuggested) => {
    let next;
    if (replaceSuggested) next = [...cardioPlans.filter(p => p.type !== "suggested"), plan];
    else next = cardioPlans.some(p => p.id === plan.id) ? cardioPlans.map(p => p.id === plan.id ? plan : p) : [...cardioPlans, plan];
    setCardioPlans(next); await saveKey("cardio-plans", next);
    setActiveCardioPlanId(plan.id); await saveKey("active-cardio-plan-id", plan.id);
  };
  const setActiveCardioPlan = async (id) => { setActiveCardioPlanId(id); await saveKey("active-cardio-plan-id", id); };
  const deleteCardioPlan = async (id) => {
    const next = cardioPlans.filter(p => p.id !== id); setCardioPlans(next); await saveKey("cardio-plans", next);
    const newActive = next[0]?.id || null; setActiveCardioPlanId(newActive); await saveKey("active-cardio-plan-id", newActive);
  };

  const globalStyle = <style>{`* { box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; } body { margin: 0; background: #0D0D0D; } .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } } input, select { font-family: inherit; }`}</style>;

  if (!authChecked) return <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", alignItems: "center", justifyContent: "center" }}>{globalStyle}<p style={{ color: "#F5C518" }}>Lädt...</p></div>;
  if (!authUser) return <>{globalStyle}<AuthScreen onLogin={handleLogin} /></>;
  if (!loaded) return <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", alignItems: "center", justifyContent: "center" }}>{globalStyle}<p style={{ color: "#F5C518" }}>Lädt...</p></div>;
  if (!profile) return <>{globalStyle}<Onboarding onComplete={saveProfile} userName={authUser?.name} /></>;
  if (!offerSeen) return <>{globalStyle}<PremiumOffer onDismiss={dismissOffer} onUpgrade={() => { setIsPremium(true); saveKey("premium", true); dismissOffer(); }} /></>;

  const tabs = [{ id: "home", label: "Home", icon: Home }, { id: "food", label: "Essen", icon: Utensils }, { id: "training", label: "Training", icon: Dumbbell }, { id: "cardio", label: "Cardio", icon: Footprints }];

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D" }}>
      {globalStyle}
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} onUpgrade={() => { setIsPremium(true); saveKey("premium", true); setShowPremium(false); }} />}
      {showTipsPage && <PersonalTipsPage onBack={() => setShowTipsPage(false)} />}
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "16px 16px 0" }}>
        {tab === "home" && <HomeTab profile={profile} targets={targets} selectedDate={selectedDate} setSelectedDate={setSelectedDate} weightLog={weightLog} waterLog={waterLog} mealLog={mealLog} workoutLog={workoutLog} addWeight={addWeight} addWater={addWater} isPremium={isPremium} setShowPremium={setShowPremium} resetPremium={() => { setIsPremium(false); saveKey("premium", false); }} authUser={authUser} onLogout={handleLogout} />}
        {tab === "food" && <FoodTab profile={profile} targets={targets} selectedDate={selectedDate} mealLog={mealLog} addMeal={addMeal} customFoods={customFoods} addCustomFood={addCustomFood} isPremium={isPremium} setShowPremium={setShowPremium} savedRecipes={savedRecipes} addSavedRecipe={addSavedRecipe} removeSavedRecipe={removeSavedRecipe} planOverrides={planOverrides} setPlanOverride={setPlanOverride} />}
        {tab === "training" && <TrainingTab profile={profile} workoutLog={workoutLog} addWorkout={addWorkout} plans={plans} activePlanId={activePlanId} savePlan={savePlan} setActivePlan={setActivePlan} deletePlan={deletePlan} isPremium={isPremium} setShowPremium={setShowPremium} dayRatings={dayRatings} setDayRating={setDayRating} />}
        {tab === "cardio" && <CardioTab profile={profile} cardioLog={cardioLog} addCardio={addCardio} setCardioFeedback={setCardioFeedback} cardioPlans={cardioPlans} activeCardioPlanId={activeCardioPlanId} saveCardioPlan={saveCardioPlan} setActiveCardioPlan={setActiveCardioPlan} deleteCardioPlan={deleteCardioPlan} isPremium={isPremium} setShowPremium={setShowPremium} runPhotos={runPhotos} addRunPhoto={addRunPhoto} deleteRunPhoto={deleteRunPhoto} homeAddress={homeAddress} setHomeAddress={setHomeAddress} />}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#1A1A1A", borderTop: "1px solid #2A2A2A" }}>
        <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "10px 0" }}>
          {tabs.map(t => { const Icon = t.icon; const active = tab === t.id; return <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center", color: active ? "#F5C518" : "#666" }}><Icon size={20} /><p style={{ fontSize: 9, marginTop: 2 }}>{t.label}</p></button>; })}
          <button onClick={() => { if (isPremium) setShowTipsPage(true); else setShowPremium(true); }} style={{ width: 46, height: 46, borderRadius: "50%", background: "#F5C518", border: "none", cursor: "pointer", marginTop: -14, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={22} color="#111" /></button>
        </div>
      </div>
    </div>
  );
}
