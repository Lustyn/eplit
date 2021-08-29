# eplit
eplit is a command line tool for losslessly splitting and merging video via remuxing.

To do this, eplit uses `mkvmerge` (MKVToolnix) and `mediainfo`. Both are required to be installed on your system to use eplit.

As a bonus, eplit (optionally) outputs chapters alongside your video so that you can jump between the parts of your video quickly.

# Usage

Simply run eplit and supply your configuration file:

    eplit myvideo.eplit.json

eplit is configured using JSON files, often looking something like this:

```json
{
    "inputs": [
        {
            "filename": "input.mkv",
            "segments": [
                {
                    "from": "00:00:00.000",
                    "id": "intro",
                    "name": "Intro"
                },
                {
                    "from": "00:00:40.432",
                    "id": "ep1",
                    "name": "Episode 1"
                },
                {
                    "from": "00:12:52.329",
                    "id": "ep2",
                    "name": "Episode 2"
                }
            ]
        }
    ],
    "outputs": [
        {
            "filename": "episode1.mkv",
            "segments": ["intro", "ep1"]
        },
        {
            "filename": "episode2.mkv",
            "segments": ["intro", "ep2"]
        }
    ]
}
```

A more in-depth example is available in [example.eplit.json](example.eplit.json)