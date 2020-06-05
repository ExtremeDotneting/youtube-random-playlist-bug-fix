# Youtube random playlist bug fix

[Tampermonkey](https://www.tampermonkey.net/) script that add dirty fix for youtube playlist bug.

Bug: youtube exit playlist when random mix enabled if there too many videos.

Fix: script check if video ended and relocate to another random video of playlist if next video link not belong to this playlist. If there normal link - use automatic handler.