#!/usr/bin/env python3
"""habib-home-uc v2 (2026-11-26): the Home and Lights tabs from uc-home-test (Sections view,
Habib Glass look, build_home_sections_test.py) replace the MVP FreeSpace tabs; the Media tab
is kept as it was (backup habib-home-uc-backup-2026-11-26-pre-glass.json).
Usage: python3 build_home_sections_test.py > uc-home-test.json
       python3 build_habib_home_uc_v2.py > habib-home-uc.json
"""
import json
import os
import sys

here = os.path.dirname(os.path.abspath(__file__))
new = json.load(open(os.path.join(here, "uc-home-test.json")))
old = json.load(open(os.path.join(here, "habib-home-uc-backup-2026-11-26-pre-glass.json")))
media = [v for v in old["views"] if v["path"] == "media"]
json.dump({"views": new["views"] + media}, sys.stdout, separators=(",", ":"), ensure_ascii=False)
