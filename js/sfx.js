// ============================================================
// HIỆU ỨNG ÂM THANH MÀN MỞ ĐẦU (Web Audio)
// - Tiếng sột soạt màn nhung: tổng hợp bằng nhiễu lọc.
// - Tiếng máy chiếu: phát assets/audio/projector-start.mp3; thiếu file thì
//   tự tạo tiếng rè rè + lạch cạch để màn mở đầu không bị im lặng.
// AudioContext chỉ được mở trong lúc khách bấm (luật autoplay, nhất là iOS).
// ============================================================

let ctx = null;
let projectorData = null; // Promise<ArrayBuffer|null>
let projectorBuffer = null;
let projectorOut = null;  // GainNode đang phát, để tắt dần khi vào thiệp
let projectorCancelled = false;

export function preloadSfx(url) {
  projectorData = fetch(url)
    .then((res) => (res.ok ? res.arrayBuffer() : null))
    .catch(() => null);
}

// Gọi trong handler click
export function unlockAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try {
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
  } catch (err) {
    console.warn("Web Audio không dùng được:", err);
    ctx = null;
  }
}

function noiseBuffer(seconds) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

export function playCurtainSwish() {
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(2);

    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.8;
    band.frequency.setValueAtTime(500, t);
    band.frequency.linearRampToValueAtTime(1700, t + 0.7);
    band.frequency.linearRampToValueAtTime(650, t + 1.8);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.25);
    gain.gain.setValueAtTime(0.16, t + 1.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);

    // Rung biên độ nhẹ cho ra chất "sột soạt" của vải
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 9;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.05;
    lfo.connect(lfoDepth).connect(gain.gain);

    src.connect(band).connect(gain).connect(ctx.destination);
    src.start(t);
    src.stop(t + 2);
    lfo.start(t);
    lfo.stop(t + 2);
  } catch (err) {
    console.warn("Không phát được tiếng màn:", err);
  }
}

export async function playProjector(delaySec = 0) {
  if (!ctx) return;
  projectorCancelled = false;
  const when = ctx.currentTime + delaySec;
  const data = projectorData ? await projectorData : null;
  if (projectorCancelled) return;

  if (data) {
    try {
      if (!projectorBuffer) projectorBuffer = await ctx.decodeAudioData(data.slice(0));
      if (projectorCancelled) return;
      const src = ctx.createBufferSource();
      src.buffer = projectorBuffer;
      projectorOut = ctx.createGain();
      projectorOut.gain.value = 0.85;
      src.connect(projectorOut).connect(ctx.destination);
      src.start(Math.max(when, ctx.currentTime));
      return;
    } catch (err) {
      console.warn("Không giải mã được tiếng máy chiếu, dùng tiếng tổng hợp:", err);
    }
  }
  synthProjector(Math.max(when, ctx.currentTime));
}

// Tiếng máy chiếu tổng hợp ~3.4s: mô-tơ khởi động + phim chạy rè + lạch cạch nhanh dần
function synthProjector(t0) {
  try {
    const dur = 3.4;
    projectorOut = ctx.createGain();
    projectorOut.gain.setValueAtTime(0.0001, t0);
    projectorOut.gain.exponentialRampToValueAtTime(0.5, t0 + 0.35);
    projectorOut.gain.setValueAtTime(0.5, t0 + dur - 0.6);
    projectorOut.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    projectorOut.connect(ctx.destination);

    const motor = ctx.createOscillator();
    motor.type = "sawtooth";
    motor.frequency.setValueAtTime(36, t0);
    motor.frequency.linearRampToValueAtTime(70, t0 + 1.2);
    const motorLp = ctx.createBiquadFilter();
    motorLp.type = "lowpass";
    motorLp.frequency.value = 260;
    const motorGain = ctx.createGain();
    motorGain.gain.value = 0.12;
    motor.connect(motorLp).connect(motorGain).connect(projectorOut);
    motor.start(t0);
    motor.stop(t0 + dur);

    const hiss = ctx.createBufferSource();
    hiss.buffer = noiseBuffer(dur);
    const hissBp = ctx.createBiquadFilter();
    hissBp.type = "bandpass";
    hissBp.frequency.value = 3200;
    hissBp.Q.value = 0.7;
    const hissGain = ctx.createGain();
    hissGain.gain.value = 0.05;
    hiss.connect(hissBp).connect(hissGain).connect(projectorOut);
    hiss.start(t0);

    const clickBuf = noiseBuffer(0.03);
    let t = t0 + 0.05;
    let rate = 5;
    while (t < t0 + dur - 0.1) {
      const s = ctx.createBufferSource();
      s.buffer = clickBuf;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 1700 + Math.random() * 900;
      f.Q.value = 2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      s.connect(f).connect(g).connect(projectorOut);
      s.start(t);
      s.stop(t + 0.03);
      rate = Math.min(18, rate + 1.4);
      t += 1 / rate;
    }
  } catch (err) {
    console.warn("Không tạo được tiếng máy chiếu:", err);
  }
}

export function stopProjector() {
  projectorCancelled = true;
  if (!ctx || !projectorOut) return;
  try {
    const t = ctx.currentTime;
    projectorOut.gain.cancelScheduledValues(t);
    projectorOut.gain.setValueAtTime(Math.max(projectorOut.gain.value, 0.0001), t);
    projectorOut.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  } catch { /* đã dừng */ }
  projectorOut = null;
}
