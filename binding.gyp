{
  "variables": {
    "dll_files":[]
  },
  "targets": [
    {
      "target_name": "flir",
      "sources": ["inits.cc","flirCam.cc" ],
      "libraries": [],
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "vendor/FreeImage/include",
        "vendor/flir",
      ],
      "copies": [{
        "destination": "build/release",
        "files": []
      }],
      "library_dirs": [],
    }
  ]
}
