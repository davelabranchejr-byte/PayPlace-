# PayPlacePerView starter collection

These six videos come from Dave’s existing PayPlace video files. The posters are stills from those videos, extracted without cropping. No new character artwork was generated.

| Packaged video | Supplied source | Duration |
| --- | --- | --- |
| daddy-episode-1.mp4 | daddy-episode-1-v4(2).mp4 | 66 seconds |
| pawrats-money-trees.mp4 | pawrats-episode-1-money-trees-v3.mp4 | 62 seconds |
| chapo-purple-pans.mp4 | Chapo_Purple_Pans_Reel.mp4 | 31 seconds |
| chapo-chopper.mp4 | Chapo_Rebuilt_Full_Frame_Reel.mp4 | 31 seconds |
| bobbie-mirror.mp4 | Bobbie_Mirror_Reel_No_Cropping.mp4 | 31 seconds |
| coffee-break.mp4 | PayPlace_RYZE_Full_Commercial_iPhone_Compatible.mp4 | 31 seconds |

The two larger episodes were encoded as H.264/AAC at their original frame dimensions for a smaller app bundle. The four commercials were remuxed with stream copy; their picture and sound were not re-encoded. Every MP4 has its metadata at the beginning for prompt playback. Supplied originals remain intact.

The catalog is in `src/payplace-per-view.mjs`, and the static media references are in `src/PerViewMedia.js`. These assets are bundled for offline playback; this first version has no remote catalog or video-upload interface.
