For some reason, there are 13 missing categories - that is, the database contains 18417 categories, each with a unique id between 1 and 18430. However, some numbers are unused - possibly because of deletions and readditions in a postgres database.

Those missing numbers are: [10044,11497,11500,11507,11509,11510,11511,11545,11644,11708,11887,11888,18424]

Searching on those numbers should return 'null' so we'll just do a "re-roll" in those cases.
