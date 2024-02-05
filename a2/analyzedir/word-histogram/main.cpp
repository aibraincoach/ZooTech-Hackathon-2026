#include <cstdio>
#include <string>
#include <vector>
#include <unordered_map>
#include <algorithm>
#include <set>

constexpr int MAX_WORD_SIZE = 1024;

//
// returns the next word from stdin
//   - word is a sequence of characters [a-zA-Z]
//   - the word is converted into lower case
//   - words are separated by any non alphabetic characters
//   - return empty string on EOF
//  example:
//   "   Hello..  World:) !" --> ["hello", "world", ""]
//  Written by Pavol Federl (2020)
//
std::string
next_word()
{
  std::string result;
  while(1) {
    int c = fgetc(stdin);
    if(c == EOF) break;
    c = tolower(c);
    if(! isalpha(c)) {
      if(result.size() == 0)
        continue;
      else
        break;
    }
    else {
      if(result.size() >= MAX_WORD_SIZE) {
        printf("input exceeded %d word size, aborting...\n", MAX_WORD_SIZE);
        exit(-1);
      }
      result.push_back(c);
    }
  }
  return result;
}

int
main( int argc, char ** argv)
{
  // parse command line arguments
  int n = 5; bool err = false;
  if( argc == 2) {
    if( 0 == sscanf(argv[1], "%d", &n)) err = true;
  } else if( argc > 2) err = true;
  if( n < 1) err = true;
  if( err) { printf("Usage: whist [n]\n"); exit(-1); }
  
  // We'll use C++ built-in dictionary (implemented as a hash table)
  // std::unordered_map<std::string,int> to build the histogram. It
  // claims O(1) average lookup, so building the histogram should be
  // O(n).
  std::unordered_map<std::string,int> hist;
  while(1) {
    auto w = next_word();
    if(w.size() == 0) break;
    hist[w] ++;
  }
  // At this point hist[word] contains the number of occurences of
  // word in the input.

  // debug output - to print all word counts, unsorted
  if(false) { // disabled
    printf("All words with counts:\n");
    for(auto & h : hist) {
      printf("%7d: %s\n", h.second, h.first.c_str());
    }
  }

  // Now we need to calculate top N entries from our dictionary.
  // We'll do it in two different ways.
  
  // Approach 1
  // ===========
  // we put the contents of hist[] into std::vector and then sort it

  // first we place the words and counts into array (with count
  // negative to reverse the sort)
  std::vector<std::pair<int,std::string>> arr;
  for(auto & h : hist)
    arr.emplace_back(-h.second, h.first);
  // if we have more than N entries, we'll sort partially, since
  // we only need the first N to be sorted
  if(arr.size() > size_t(n)) {
    std::partial_sort(arr.begin(), arr.begin() + n, arr.end());
    // drop all entries after the first n
    arr.resize(n);
  } else {
    std::sort(arr.begin(), arr.end());
  }
  // now we can print the n entries
  printf("%d most common words (Approach 1):\n", n);
  for(auto & a : arr)
    printf("  - %s x %d\n", a.second.c_str(), -a.first);


  // Approach 2:
  // ============
  // another way to get the top n entries is to use a min/max queue,
  // which can be simulated by using std::set (a balanced binary tree)
  // we just make sure that our set size is kept at size n by discarding
  // the min. element after inserting more than n

  // we'll use the negated count trick again to keep it consistent
  // with option 1
  std::set<std::pair<int,std::string>> mmq;
  for(auto & h : hist) {
    // insert an entry
    mmq.emplace(-h.second, h.first);
    // if we have more than n, get rid of the smallest one
    if(mmq.size() > size_t(n))
      mmq.erase(std::prev(mmq.end()));
  }
  // Now we can print the first n entries.  All we need to do is to
  // iterate over the set, the traversal is guaranteed to start at the
  // max. entry.
  printf("%d most common words (Approach 2):\n", n);
  for(auto & a : mmq)
    printf("  - %s x %d\n", a.second.c_str(), -a.first);

  return 0;
}

