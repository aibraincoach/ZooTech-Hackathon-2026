SOURCES = main.cpp
CPPC = g++
CPPFLAGS = -c -Wall -O2
LDFLAGS = 
OBJECTS = $(SOURCES:.cpp=.o)
TARGET = whist

all: $(TARGET)

%.o : %.c
$(OBJECTS): Makefile 

.cpp.o:
	$(CPPC) $(CPPFLAGS) $< -o $@

$(TARGET): $(OBJECTS)
	$(CPPC) -o $@ $(LDFLAGS) $(OBJECTS)

.PHONY: clean
clean:
	rm -f *~ *.o $(TARGET) 

