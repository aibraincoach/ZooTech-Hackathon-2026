## sample code for recursive directory scanning

The program recursively scans the directory specified on command line and reports a subdirectory that contains the most files.

To compile all code, type:
```
$ make
```

To run the resulting code on directory test1:
```
$ ./scan test1
Largest diretory: "include/debug" with 4 files.
```

You can verify the result are correct:
```
$ tree test1
test1
├── d
│   ├── 1.jpg
│   └── 2.txt
├── f1.txt
└── include
    ├── debug
    │   ├── f1
    │   ├── f2
    │   ├── f3
    │   └── f4
    └── release
        ├── a
        ├── b
        └── c

4 directories, 10 files
```
