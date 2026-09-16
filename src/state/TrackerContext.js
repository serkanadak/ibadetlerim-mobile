// İbadet takip durumu: günlük işaretlemeler, yıllık/ömürlük işaretlemeler,
// ilave (kullanıcı tanımlı) ibadetler ve ayarlar.
//
// Kalıcılık logic/storage.js üzerinden yapılır: veri hem localStorage'a hem
// IndexedDB'ye yazılır (biri silinirse diğeri kurtarır), okumada daha yeni
// olan kullanılır. Ayrıca: okuma başarısızsa hiç yazılmaz, bayat sekme
// güncel verinin üzerine yazamaz ve dolu kaydın üzerine boş durum yazılamaz.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { readState, writeState, requestPersistentStorage } from '../logic/storage';
import { mergeBackup, parseBackup, countMarks } from '../logic/backup';
import { todayKey, yearKey } from '../logic/date';

const TrackerContext = createContext(null);
// Pencereler arası haberleşme: bir sekme yazınca diğerleri haberdar olur.
const SYNC_CHANNEL = 'ibadetlerim_sync';
const SYNC_KEY = 'ibadetlerim_sync_rev';

function readRevMarker() {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const v = window.localStorage.getItem(SYNC_KEY);
    return v == null ? null : Number(v) || 0;
  } catch (e) {
    return null;
  }
}

function writeRevMarker(rev) {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SYNC_KEY, String(rev));
  } catch (e) {
    /* işaret yazılamazsa kaydın kendi rev'i yine doğruyu söylüyor */
  }
}

// Kayıttaki veri miktarı — kazara boş/eksik durumla üzerine yazmayı önlemek için.
function volumeOf(d) {
  const o = d || {};
  return {
    days: Object.keys(o.byDate || {}).length,
    marks: countMarks(o.byDate),
    custom: (o.customItems || []).length,
    lifetime: Object.keys(o.lifetime || {}).filter((k) => o.lifetime[k]).length,
  };
}

// Depodaki veri varken yazılacak olan bomboşsa bu normal bir düzenleme değildir.
function looksLikeDataLoss(stored, next) {
  return ['days', 'marks', 'custom', 'lifetime'].some((k) => stored[k] >= 2 && next[k] === 0);
}

const DEFAULT_SETTINGS = {
  gender: 'male', // 'male' | 'female'
  showNafile: false,
  kurbanEligible: false,
  ramadanStart: '',
  ramadanEnd: '',
  eidRamadanStart: '',
  eidRamadanEnd: '',
  eidKurbanStart: '',
  eidKurbanEnd: '',
  kazaStartDate: '', // geçmiş namaz (kaza) takibinin başlangıç tarihi
};

const initialState = {
  loaded: false,
  byDate: {}, // { '2026-07-09': { itemId: true } }
  byYear: {}, // { '2026': { itemId: true | 'na' } }
  lifetime: {}, // { itemId: true | 'na' }
  customItems: [], // kullanıcının eklediği ilave ibadetler
  settings: DEFAULT_SETTINGS,
};

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        loaded: true,
        byDate: action.payload?.byDate || {},
        byYear: action.payload?.byYear || {},
        lifetime: action.payload?.lifetime || {},
        customItems: action.payload?.customItems || [],
        settings: { ...DEFAULT_SETTINGS, ...(action.payload?.settings || {}) },
      };
    case 'TOGGLE_DATE': {
      const { dateKey, itemId } = action;
      const dayMap = { ...(state.byDate[dateKey] || {}) };
      dayMap[itemId] = !dayMap[itemId];
      return { ...state, byDate: { ...state.byDate, [dateKey]: dayMap } };
    }
    case 'SET_DATE': {
      const { dateKey, itemId, value } = action;
      const dayMap = { ...(state.byDate[dateKey] || {}) };
      dayMap[itemId] = value;
      return { ...state, byDate: { ...state.byDate, [dateKey]: dayMap } };
    }
    case 'BULK_SET': {
      const { pairs, value } = action; // pairs: [{ dateKey, itemId }]
      const byDate = { ...state.byDate };
      for (const { dateKey, itemId } of pairs) {
        byDate[dateKey] = { ...(byDate[dateKey] || {}), [itemId]: value };
      }
      return { ...state, byDate };
    }
    // status: true (yapıldı) | 'na' (bana uygulanmıyor) | undefined (bekliyor)
    case 'SET_YEAR_STATUS': {
      const { yKey, itemId, status } = action;
      const yMap = { ...(state.byYear[yKey] || {}) };
      if (status === undefined) delete yMap[itemId];
      else yMap[itemId] = status;
      return { ...state, byYear: { ...state.byYear, [yKey]: yMap } };
    }
    case 'SET_LIFETIME_STATUS': {
      const { itemId, status } = action;
      const lifetime = { ...state.lifetime };
      if (status === undefined) delete lifetime[itemId];
      else lifetime[itemId] = status;
      return { ...state, lifetime };
    }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'ADD_CUSTOM':
      return { ...state, customItems: [...state.customItems, action.item] };
    case 'REMOVE_CUSTOM':
      return { ...state, customItems: state.customItems.filter((i) => i.id !== action.id) };
    case 'RESET':
      return { ...initialState, loaded: true };
    default:
      return state;
  }
}

export function TrackerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // --- OKUMA / YAZMA ---
  // Sürüm numarası: bir pencerenin elindeki verinin bayat olup olmadığını
  // anlamak için. Her başarılı yazmada bir artar.
  const revRef = useRef(0);
  const savedAtRef = useRef(0);
  const skipWriteRef = useRef(false);
  // Okuma başarısız olduysa ASLA yazmayız (yoksa boş durum gerçek verinin
  // üzerine yazılır — eski kodda tam olarak bu oluyordu).
  const canWriteRef = useRef(false);
  // Kullanıcı KASTEN sıfırladıysa kayıp koruması bir sonraki yazmada devre
  // dışı kalır; yoksa "Tüm verileri sıfırla" işlemi engellenir ve veri
  // yenilemede geri gelir.
  const allowLossRef = useRef(false);

  const [readFailed, setReadFailed] = useState(false);
  const [writeFailed, setWriteFailed] = useState(false);
  const [refreshedFromOther, setRefreshedFromOther] = useState(false);
  const [blockedLoss, setBlockedLoss] = useState(null);

  const applyPayload = useCallback((payload) => {
    const p = payload || {};
    revRef.current = Number(p.rev) || 0;
    savedAtRef.current = Number(p.savedAt) || 0;
    const marker = readRevMarker();
    if (marker == null || marker < revRef.current) writeRevMarker(revRef.current);
    // Eski kayıtlar alanları kökte tutuyor; yeni kayıtlar `data` altında.
    const d = p.data && typeof p.data === 'object' ? p.data : p;
    dispatch({ type: 'HYDRATE', payload: d });
  }, []);

  useEffect(() => {
    (async () => {
      // Tarayıcı verimizi kendiliğinden silmesin (iOS'ta 7 gün kuralı).
      requestPersistentStorage().catch(() => {});
      const res = await readState();
      if (res.payload) {
        applyPayload(res.payload);
        canWriteRef.current = true;
      } else if (res.errors.length) {
        // Depo okunamadı: veri VAR olabilir. Boş durumla açıp üzerine yazmak
        // yerine yazmayı kapatıp kullanıcıya haber veriyoruz.
        setReadFailed(true);
        canWriteRef.current = false;
        dispatch({ type: 'HYDRATE', payload: {} });
      } else {
        // Gerçekten hiç kayıt yok (ilk kullanım).
        canWriteRef.current = true;
        dispatch({ type: 'HYDRATE', payload: {} });
      }
    })();
  }, [applyPayload]);

  const dataOf = useCallback(
    () => ({
      byDate: state.byDate,
      byYear: state.byYear,
      lifetime: state.lifetime,
      customItems: state.customItems,
      settings: state.settings,
    }),
    [state.byDate, state.byYear, state.lifetime, state.customItems, state.settings]
  );

  const notifyOthers = useCallback((rev) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    writeRevMarker(rev);
    try {
      if (typeof window.BroadcastChannel === 'function') {
        const ch = new window.BroadcastChannel(SYNC_CHANNEL);
        ch.postMessage({ rev });
        ch.close();
      }
    } catch (e) {
      /* haber verilemezse sürüm kontrolü yine koruyor */
    }
  }, []);

  // Depodaki kayıt bizden yeniyse onu al (bayat anlık görüntüyü yazmadan).
  // trustMarker: sık tetiklenen yolda ucuz işarete güvenilir; YAZMA yolunda
  // güvenilmez (işaret geride kalmışsa yeni veriyi ezerdik).
  const pullIfNewer = useCallback(
    async (trustMarker = true) => {
      if (trustMarker) {
        const marker = readRevMarker();
        if (marker != null && marker <= revRef.current) return false;
      }
      const res = await readState();
      const p = res.payload;
      if (!p) return false;
      const rev = Number(p.rev) || 0;
      const savedAt = Number(p.savedAt) || 0;
      if (rev > revRef.current || (rev === revRef.current && savedAt > savedAtRef.current)) {
        skipWriteRef.current = true;
        applyPayload(p);
        canWriteRef.current = true;
        setRefreshedFromOther(true);
        return true;
      }
      return false;
    },
    [applyPayload]
  );

  const persist = useCallback(
    async (data) => {
      if (!canWriteRef.current) return;
      if (await pullIfNewer(false)) return; // depo daha yeni: ezmek yerine tazelendik
      // AĞIR KAYIP KORUMASI: depoda veri varken boş/eksik durumu yazma.
      // Kullanıcı kasten sıfırladıysa (reset) bu yazmada koruma atlanır.
      const intentional = allowLossRef.current;
      allowLossRef.current = false;
      if (!intentional) {
        try {
          const cur = await readState();
          if (cur.payload) {
            const stored = volumeOf(cur.payload.data || cur.payload);
            if (looksLikeDataLoss(stored, volumeOf(data))) {
              setBlockedLoss(stored);
              return;
            }
          }
        } catch (e) {
          /* okuyamadıysak aşağıda yazmayı deneriz */
        }
      }
      const rev = revRef.current + 1;
      const savedAt = Date.now();
      const res = await writeState({ app: 'ibadetlerim', version: 1, rev, savedAt, data });
      if (res.ok) {
        revRef.current = rev;
        savedAtRef.current = savedAt;
        setWriteFailed(false);
        notifyOthers(rev);
      } else {
        setWriteFailed(true);
      }
    },
    [notifyOthers, pullIfNewer]
  );

  useEffect(() => {
    if (!state.loaded) return;
    if (skipWriteRef.current) {
      // Bu değişiklik depodan gelen tazeleme; geri yazma gereksiz.
      skipWriteRef.current = false;
      return;
    }
    persist(dataOf());
  }, [state.byDate, state.byYear, state.lifetime, state.customItems, state.settings, state.loaded, persist, dataOf]);

  // Sekmeye dönüldüğünde / başka sekme yazdığında güncel veriyi al.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
    const pull = () => pullIfNewer(true);
    const onVisible = () => {
      if (document.visibilityState !== 'hidden') pull();
    };
    window.addEventListener('focus', pull);
    document.addEventListener('visibilitychange', onVisible);
    let ch = null;
    const onSync = (e) => {
      if (!e || !e.data || (Number(e.data.rev) || 0) > revRef.current) pull();
    };
    const onStorage = (e) => {
      if (e && e.key === SYNC_KEY) pull();
    };
    if (typeof window.BroadcastChannel === 'function') {
      ch = new window.BroadcastChannel(SYNC_CHANNEL);
      ch.addEventListener('message', onSync);
    } else {
      window.addEventListener('storage', onStorage);
    }
    return () => {
      window.removeEventListener('focus', pull);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('storage', onStorage);
      if (ch) ch.close();
    };
  }, [pullIfNewer]);

  const value = useMemo(() => {
    const dKey = todayKey();
    const yKey = yearKey();

    const isCheckedOn = (dateKey, itemId) => !!state.byDate[dateKey]?.[itemId];
    const isCheckedToday = (itemId) => isCheckedOn(dKey, itemId);
    const toggleToday = (itemId) => dispatch({ type: 'TOGGLE_DATE', dateKey: dKey, itemId });
    const toggleOnDate = (dateKey, itemId) => dispatch({ type: 'TOGGLE_DATE', dateKey, itemId });
    const setCheckedToday = (itemId, value) => dispatch({ type: 'SET_DATE', dateKey: dKey, itemId, value });
    const setCheckedOnDate = (dateKey, itemId, value) => dispatch({ type: 'SET_DATE', dateKey, itemId, value });
    const bulkSetChecked = (pairs, value) => dispatch({ type: 'BULK_SET', pairs, value });

    const yearlyStatus = (itemId) => state.byYear[yKey]?.[itemId]; // true | 'na' | undefined
    const isCheckedYearly = (itemId) => yearlyStatus(itemId) === true;
    const isNotApplicableYearly = (itemId) => yearlyStatus(itemId) === 'na';
    const setYearlyStatus = (itemId, status) => dispatch({ type: 'SET_YEAR_STATUS', yKey, itemId, status });
    const toggleYearly = (itemId) => setYearlyStatus(itemId, isCheckedYearly(itemId) ? undefined : true);
    const toggleYearlyNotApplicable = (itemId) => setYearlyStatus(itemId, isNotApplicableYearly(itemId) ? undefined : 'na');

    const lifetimeStatus = (itemId) => state.lifetime[itemId]; // true | 'na' | undefined
    const isCheckedLifetime = (itemId) => lifetimeStatus(itemId) === true;
    const isNotApplicableLifetime = (itemId) => lifetimeStatus(itemId) === 'na';
    const setLifetimeStatus = (itemId, status) => dispatch({ type: 'SET_LIFETIME_STATUS', itemId, status });
    const toggleLifetime = (itemId) => setLifetimeStatus(itemId, isCheckedLifetime(itemId) ? undefined : true);
    const toggleLifetimeNotApplicable = (itemId) =>
      setLifetimeStatus(itemId, isNotApplicableLifetime(itemId) ? undefined : 'na');

    const updateSettings = (patch) => dispatch({ type: 'UPDATE_SETTINGS', patch });
    const addCustomItem = (item) => dispatch({ type: 'ADD_CUSTOM', item });
    const removeCustomItem = (id) => dispatch({ type: 'REMOVE_CUSTOM', id });
    const reset = () => {
      allowLossRef.current = true; // bilinçli silme: koruma bu yazmada atlanır
      dispatch({ type: 'RESET' });
    };

    // Yedekleme: mevcut durumu taşınabilir bir JSON metnine çevirir.
    const exportSnapshot = () => {
      const { byDate, byYear, lifetime, customItems, settings } = state;
      return JSON.stringify(
        { app: 'ibadetlerim', version: 1, exportedAt: new Date().toISOString(), data: { byDate, byYear, lifetime, customItems, settings } },
        null,
        2
      );
    };

    // Geri yükleme: yedek metnini doğrulayıp mevcut veriyle BİRLEŞTİRİR.
    // Eskiden üzerine yazıyordu; eski bir yedeği yüklemek o yedekten sonraki
    // işaretleri siliyordu. Artık hiçbir işaret kaybolmaz.
    // Başarılıysa { added }, hata varsa { error } döner.
    const importSnapshot = (text) => {
      const parsed = parseBackup(text);
      if (parsed.error) return { error: parsed.error };
      const cur = {
        byDate: state.byDate,
        byYear: state.byYear,
        lifetime: state.lifetime,
        customItems: state.customItems,
        settings: state.settings,
      };
      const merged = mergeBackup(cur, parsed.data);
      // Birleştirme sonrası veri en az mevcut kadar olduğu için kayıp koruması
      // devreye girmez; yazma normal akışta yapılır.
      dispatch({ type: 'HYDRATE', payload: merged.data });
      return { added: merged.added };
    };

    // Yedekteki veriyi olduğu gibi YÜKLER (birleştirmeden). Kurtarma
    // ekranından, "bu kaydı kullan" için.
    const replaceAll = (data) => dispatch({ type: 'HYDRATE', payload: data });

    return {
      loaded: state.loaded,
      byDate: state.byDate,
      byYear: state.byYear,
      lifetime: state.lifetime,
      customItems: state.customItems,
      settings: state.settings,
      todayKey: dKey,
      yearKeyStr: yKey,
      isCheckedOn,
      isCheckedToday,
      toggleToday,
      toggleOnDate,
      setCheckedToday,
      setCheckedOnDate,
      bulkSetChecked,
      isCheckedYearly,
      toggleYearly,
      isNotApplicableYearly,
      toggleYearlyNotApplicable,
      isCheckedLifetime,
      toggleLifetime,
      isNotApplicableLifetime,
      toggleLifetimeNotApplicable,
      updateSettings,
      addCustomItem,
      removeCustomItem,
      reset,
      exportSnapshot,
      importSnapshot,
      replaceAll,
      // depolama durumu (Yedekle ekranında gösterilir)
      readFailed,
      writeFailed,
      refreshedFromOther,
      ackRefreshed: () => setRefreshedFromOther(false),
      blockedLoss,
    };
  }, [state, readFailed, writeFailed, refreshedFromOther, blockedLoss]);

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error('useTracker must be used within TrackerProvider');
  return ctx;
}
