#include <unistd.h>
#include <stdio.h>
#include <ctype.h>
#include <string>

const size_t BUFFER_SIZE = 1 << 20;  // 1 MB

// Global variables to track characters read into memory
unsigned char buffer[BUFFER_SIZE];
int buff_size = 0;
int buff_pos = 0;

// Returns the next byte from stdin, or -1 on EOF
// Returns characters stored in buffer[] until it is empty
// When buffer[] is empty, it is replenished by calling read()
int fast_read_one_character_from_stdin() {
    // Check if buffer[] is empty
    if (buff_pos >= buff_size) {
        // Buffer is empty, let's replenish it
        buff_size = read(STDIN_FILENO, buffer, sizeof(buffer));
        // Detect EOF
        if (buff_size <= 0)
            return -1;
        // Reset position from where we'll return characters
        buff_pos = 0;
    }
    // Return the next character from the buffer and update position
    return buffer[buff_pos++];
}

// Returns the next consecutive sequence of digit characters from standard input
std::string stdin_read_digits() {
    std::string result;
    while (true) {
        int c = fast_read_one_character_from_stdin();
        if (c == -1)
            break;
        if (!isdigit(c)) {
            if (result.size() > 0)
                break;
        } else {
            result.push_back(c);
        }
    }
    return result;
}

// Returns the longest integer encountered on standard input
// In case of ties, returns the first such longest integer
std::string get_longest_int() {
    std::string max_int;
    while (1) {
        std::string word = stdin_read_digits();
        if (word.size() == 0)
            break;
        if (word.size() <= max_int.size())
            continue;
        max_int = word;
    }
    return max_int;
}

int main() {
    std::string max_int = get_longest_int();
    printf("Longest integer: %s\n", max_int.c_str());
    return 0;
}
