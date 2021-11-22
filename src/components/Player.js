import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faAngleLeft,
  faAngleRight,
  faPause,
  faVolumeUp,
  faVolumeDown,
  faVolumeMute,
} from "@fortawesome/free-solid-svg-icons";

const Player = ({
  currentSong,
  isPlaying,
  setIsPlaying,
  setCurrentSong,
  songs,
}) => {
  //Ref
  const audioRef = useRef(null);

  //Event Handlers
  const playSongHandler = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(!isPlaying);
      document.querySelector("#album-img").classList.remove("playing");
    } else {
      audioRef.current.play();
      setIsPlaying(!isPlaying);
      document.querySelector("#album-img").classList.add("playing");
    }
  };

  const timeUpdateHandler = (e) => {
    const current = e.target.currentTime;
    const duration = e.target.duration || 0;
    const roundedCurrent = Math.round(current);
    const roundedDuration = Math.round(duration);
    const animationPercentage = Math.round(
      (roundedCurrent / roundedDuration) * 100
    );
    setSongInfo({
      ...songInfo,
      currentTime: current,
      duration,
      animationPercentage,
    });
  };

  const formatTime = (time) => {
    return (
      Math.floor(time / 60) + ":" + ("0" + Math.floor(time % 60)).slice(-2)
    );
  };

  const dragHandler = (e) => {
    audioRef.current.currentTime = e.target.value;
    setSongInfo({ ...songInfo, currentTime: e.target.value });
  };

  const volumeHandler = (e) => {
    const volumeAnimationPercentage = Math.round((e.target.value / 1) * 100);
    audioRef.current.volume = e.target.value;
    setSongInfo({ ...songInfo, volumeAnimationPercentage: volumeAnimationPercentage, volume: e.target.value });
  };

  const volumeInputHandler = (e) => {
    const volumeTrack = document.querySelector(".volume-track");
    if (volumeTrack.classList.contains("active")) {
      volumeTrack.style.width = "0%";
      volumeTrack.classList.remove("active");
    } else {
      volumeTrack.style.width = "max-content";
      volumeTrack.classList.add("active");
    }
  }

  const autoPlayHandler = () => {
    if (isPlaying) {
      audioRef.current.play();
    }
  };

  const skipTrackHandler = async (direction) => {
    let currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    if (direction === "skip-forward") {
      await setCurrentSong(
        songs[currentIndex === songs.length - 1 ? 0 : currentIndex + 1]
      );
    } else {
      if (songInfo.currentTime >= 3) {
        audioRef.current.currentTime = 0;
      } else {
        await setCurrentSong(
          songs[currentIndex === 0 ? songs.length - 1 : currentIndex - 1]
        );
      }
    }
  };

  const songEndHandler = async () => {
    let currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    await setCurrentSong(
      songs[currentIndex === songs.length - 1 ? 0 : currentIndex + 1]
    );
    if (isPlaying) audioRef.current.play();
  };

  //State
  const [songInfo, setSongInfo] = useState({
    currentTime: 0,
    duration: 0,
    animationPercentage: 0,
    volumeAnimationPercentage: 100,
    volume: 1,
  });

  //Add the styles
  const trackAnim = {
    transform: `translateX(${songInfo.animationPercentage}%)`,
  };

  const trackVolumeAnim = {
    transform: `translateX(${songInfo.volumeAnimationPercentage}%)`,
  };

  return (
    <div className="player">
      <div className="time-control">
        <p>{formatTime(songInfo.currentTime)}</p>
        <div
          style={{
            background: `linear-gradient(to right, ${currentSong.color[0]}, 
              ${currentSong.color[1]})`,
          }}
          className="track"
        >
          <input
            min={0}
            max={songInfo.duration}
            value={songInfo.currentTime}
            onChange={dragHandler}
            type="range"
            name=""
            id=""
          />
          <div style={trackAnim} className="animate-track"></div>
        </div>
        <p>{formatTime(songInfo.duration)}</p>
      </div>
      <div className="play-control">
        <FontAwesomeIcon
          onClick={() => skipTrackHandler("skip-back")}
          className="skip-back"
          size="2x"
          icon={faAngleLeft}
        />
        <FontAwesomeIcon
          onClick={playSongHandler}
          className="play"
          size="2x"
          icon={isPlaying ? faPause : faPlay}
        />
        <FontAwesomeIcon
          onClick={() => skipTrackHandler("skip-forward")}
          className="skip-forward"
          size="2x"
          icon={faAngleRight}
        />
        <div className="volume-control">
          <FontAwesomeIcon
            onClick={volumeInputHandler}
            className="volume-handler"
            size="2x"
            icon={songInfo.volume > 0.5 ? faVolumeUp : songInfo.volume === "0" ? faVolumeMute : faVolumeDown}
          />
          <div
            style={{
              background: `linear-gradient(to right, ${currentSong.color[0]}, 
              ${currentSong.color[1]})`,
            }}
            className="volume-track"
          >
            <input min={0} max={1} value={songInfo.volume} onChange={volumeHandler} type="range" step="0.01" name="" id="" />
            <div style={trackVolumeAnim} className="animate-volume-track"></div>
          </div>
        </div>
      </div>
      <audio
        onTimeUpdate={timeUpdateHandler}
        onLoadedMetadata={timeUpdateHandler}
        onLoadedData={autoPlayHandler}
        ref={audioRef}
        src={currentSong.audio}
        onEnded={songEndHandler}
        volume={songInfo.volume}
      ></audio>
    </div>
  );
};

export default Player;
