# word-histogram

C++ program that reads in standard input and displays the most
frequent words. The purpose of this program is to demonstrate the use of
`std::unordered_map`, and also `std::sort`, `std::partial_sort` and `std::set`.

The program uses `std::unordered_set` to build the histogram.

To report the top N entries from the histogram, the program uses
2 different techniques.

First technique transfers the histogram entries into a 1D array
(`std::vector`), and then sorts it using `std::sort`, or
`std::partial_sort`.

The second technique is basedon on a min-max heap idea, where we
transfer the histogram in to the queue, but keep the size of the queue
at n. Since min-max heaps are currently not part of the standard c++
librarry, this program uses uses `std::set` (usually implemented as a
balanced binary tree) to approximate it.

To test the program, you can:
```
$ make
$ ./whist 5 < romeo-and-juliet.txt
5 most common words (Approach 1):
  - and x 720
  - the x 680
  - i x 658
  - to x 577
  - a x 470
5 most common words (Approach 2):
  - and x 720
  - the x 680
  - i x 658
  - to x 577
  - a x 470
```
