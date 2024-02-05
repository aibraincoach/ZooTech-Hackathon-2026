SOURCES = main.cpp
CPPC = g++
CPPFLAGS = -c -Wall -O2
LDLIBS = 
OBJECTS = $(SOURCES:.cpp=.o)
TARGET = scan

all: $(TARGET)

%.o : %.c
$(OBJECTS): Makefile 

.cpp.o:
	$(CPPC) $(CPPFLAGS) $< -o $@

$(TARGET): $(OBJECTS)
	$(CPPC) -o $@ $(OBJECTS) $(LDLIBS)

.PHONY: clean
clean:
	rm -f *~ *.o $(TARGET) 

