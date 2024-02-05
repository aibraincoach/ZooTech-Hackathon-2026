#include <cassert>
#include <cstdio>
#include <cstdlib>
#include <dirent.h>
#include <iostream>
#include <sys/resource.h>
#include <sys/stat.h>
#include <sys/time.h>
#include <sys/types.h>
#include <unistd.h>

//  Written by Pavol Federl (2020)

/// check if path refers to a directory
static bool is_dir( const std::string & path)
{
  struct stat buff;
  if (0 != stat(path.c_str(), &buff)) return false;
  return S_ISDIR(buff.st_mode);
}

/// check if path refers to a file
static bool is_file(const std::string & path)
{
  struct stat buff;
  if (0 != stat(path.c_str(), &buff)) return false;
  return S_ISREG(buff.st_mode);
}

/// check if string starts with another string
static bool starts_with(const std::string & str, const std::string & suffix)
{
  if (str.size() < suffix.size()) return false;
  else
    return 0 == str.compare(0, suffix.size(), suffix);
}

static void usage(const std::string & pname, int exit_code)
{
  printf("Usage: %s directory_name\n", pname.c_str());
  exit(exit_code);
}

struct DirInfo {
  std::string path;
  long count = 0;
};

// returns the directory with most files
static DirInfo scan(const std::string & dir)
{
  DirInfo best { "", -1};
  DirInfo local_best { dir , 0};
  auto dirp = opendir( dir.c_str());
  assert(dirp != nullptr);
  for (auto de = readdir(dirp); de != nullptr; de = readdir(dirp)) {
    std::string name = de->d_name;
    if (name == "." or name == "..") continue;
    std::string path = dir + "/" + name;
    if (is_file(path)) {
      local_best.count ++;
      continue;
    }
    assert(is_dir(path));
    auto sub_result = scan(path);
    if( sub_result.count >= best.count )
      best = sub_result;
  }
  if(local_best.count >= best.count)
    best = local_best;

  return best;
}

int main(int argc, char ** argv)
{

  if (argc != 2 || chdir(argv[1])) usage(argv[0], -1);

  DirInfo res = scan(".");
  // remove leading ./
  if( starts_with(res.path, "./"))
    res.path = res.path.substr(2);
  std::cout << "Largest diretory: \"" + res.path + "\" with " << res.count << " files.\n";
  return 0;
}
