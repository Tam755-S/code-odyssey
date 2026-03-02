document.addEventListener('DOMContentLoaded', () => {
  const volumeSlider = document.getElementById('volume');
  const volumeLabel = document.getElementById('volume-label');
  const muteBtn = document.getElementById('mute-btn');

  let previousVolume = volumeSlider.value;

  // แสดงค่าระดับเสียง
  volumeSlider.addEventListener('input', () => {
    volumeLabel.textContent = `${volumeSlider.value}%`;
    setVolume(volumeSlider.value);
    if (volumeSlider.value > 0) {
      previousVolume = volumeSlider.value;
      muteBtn.textContent = '🔇 Mute';
    }
  });

  // ปุ่ม Mute / Unmute
  muteBtn.addEventListener('click', () => {
    if (volumeSlider.value > 0) {
      previousVolume = volumeSlider.value;
      volumeSlider.value = 0;
      volumeLabel.textContent = '0%';
      setVolume(0);
      muteBtn.textContent = '🔊 Unmute';
    } else {
      volumeSlider.value = previousVolume;
      volumeLabel.textContent = `${previousVolume}%`;
      setVolume(previousVolume);
      muteBtn.textContent = '🔇 Mute';
    }
  });

  // ฟังก์ชันปรับเสียงของเกม
  function setVolume(value) {
    const volume = value / 100;
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => audio.volume = volume);
  }
});
