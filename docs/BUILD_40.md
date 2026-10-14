# Build 40: readable Smart Mirror on phone screens

Bobbie's Smart Mirror could expand its vertical scroll content beyond the phone viewport, leaving artwork, tabs and form text off the right edge. The scroll content now uses the actual measured viewport width, with a full-width inner column capped at 600 points on larger screens. Both artwork frames are bounded by that column. The approved room image uses the existing contained-illustration component and its natural aspect ratio.

The header title can wrap while the close button retains its touch area. Mirror tab labels can shrink and wrap within their columns. The light-colored modal requests dark status-bar text. Vertical scrolling and keyboard avoidance remain available for every panel.

Validation: 75 source files passed binding checks; all 108 tests passed; iOS, Android and web exports succeeded. The regression opens every mirror tab at measured widths 320, 353, 393, 430, 568 and 844, changes width while the modal is open, checks the contained artwork and all four tabs, completes a purchase check, and closes the modal. Physical iPhone visual confirmation remains necessary after installing Build 40.

Build 39 source and all approved artwork are retained. No artwork was regenerated for this layout correction.
