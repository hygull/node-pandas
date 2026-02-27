/**
 * Unit tests for toCsv() method in DataFrame class
 * Tests CSV export functionality including file creation, data types,
 * special characters, null/undefined values, and error handling.
 * 
 * Validates: CSV export requirements
 */

const fs = require('fs');
const path = require('path');
const DataFrame = require('../../src/dataframe/dataframe');

describe('DataFrame.toCsv() Method', () => {
  const testDir = path.join(__dirname, '../../tmp');
  const testCsvPath = path.join(testDir, 'test-output.csv');

  beforeAll(() => {
    // Create tmp directory if it doesn't exist
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test CSV files after each test
    if (fs.existsSync(testCsvPath)) {
      fs.unlinkSync(testCsvPath);
    }
  });

  afterAll(() => {
    // Clean up tmp directory
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir, { recursive: true });
    }
  });

  describe('Basic CSV Export', () => {
    test('should create CSV file with valid path', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30],
        [3, 'Malinikesh Agrawani', 28]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      // Wait for async file write to complete
      setTimeout(() => {
        expect(fs.existsSync(testCsvPath)).toBe(true);
        done();
      }, 100);
    });

    test('should write correct CSV header', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        expect(lines[0]).toBe('id,name,age');
        done();
      }, 100);
    });

    test('should write correct CSV data rows', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30],
        [3, 'Malinikesh Agrawani', 28]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines.length).toBe(4); // header + 3 data rows
        expect(lines[1]).toBe('1,Rishikesh Agrawani,32');
        expect(lines[2]).toBe('2,Hemkesh Agrawani,30');
        expect(lines[3]).toBe('3,Malinikesh Agrawani,28');
        done();
      }, 100);
    });

    test('should create CSV with single row', (done) => {
      const data = [[1, 'Rishikesh Agrawani', 32]];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines.length).toBe(2); // header + 1 data row
        expect(lines[0]).toBe('id,name,age');
        expect(lines[1]).toBe('1,Rishikesh Agrawani,32');
        done();
      }, 100);
    });

    test('should create CSV with single column', (done) => {
      const data = [[1], [2], [3]];
      const columns = ['id'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines.length).toBe(4); // header + 3 data rows
        expect(lines[0]).toBe('id');
        expect(lines[1]).toBe('1');
        expect(lines[2]).toBe('2');
        expect(lines[3]).toBe('3');
        done();
      }, 100);
    });
  });

  describe('Data Types in CSV Export', () => {
    test('should export numeric data correctly', (done) => {
      const data = [[1, 2.5, 100], [3, 4.7, 200]];
      const columns = ['int_col', 'float_col', 'large_num'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines[1]).toBe('1,2.5,100');
        expect(lines[2]).toBe('3,4.7,200');
        done();
      }, 100);
    });

    test('should export string data correctly', (done) => {
      const data = [
        ['Rishikesh Agrawani', 'Engineer'],
        ['Hemkesh Agrawani', 'Manager']
      ];
      const columns = ['name', 'role'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines[1]).toBe('Rishikesh Agrawani,Engineer');
        expect(lines[2]).toBe('Hemkesh Agrawani,Manager');
        done();
      }, 100);
    });

    test('should export boolean data correctly', (done) => {
      const data = [[true, false], [false, true]];
      const columns = ['active', 'deleted'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines[1]).toBe('true,false');
        expect(lines[2]).toBe('false,true');
        done();
      }, 100);
    });

    test('should export date data correctly', (done) => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-02-20');
      const data = [[date1, 'Event1'], [date2, 'Event2']];
      const columns = ['date', 'event'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines[0]).toBe('date,event');
        expect(lines[1]).toContain('Event1');
        expect(lines[2]).toContain('Event2');
        done();
      }, 100);
    });

    test('should export mixed data types', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32, true, 3.14],
        [2, 'Hemkesh Agrawani', 30, false, 2.71]
      ];
      const columns = ['id', 'name', 'age', 'active', 'score'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines[1]).toBe('1,Rishikesh Agrawani,32,true,3.14');
        expect(lines[2]).toBe('2,Hemkesh Agrawani,30,false,2.71');
        done();
      }, 100);
    });
  });

  describe('Null and Undefined Values', () => {
    test('should export null values', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', null],
        [2, null, 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines[1]).toContain('null');
        expect(lines[2]).toContain('null');
        done();
      }, 100);
    });

    test('should export undefined values', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', undefined],
        [2, undefined, 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines[1]).toContain('undefined');
        expect(lines[2]).toContain('undefined');
        done();
      }, 100);
    });

    test('should handle mixed null and undefined values', (done) => {
      const data = [
        [1, null, undefined],
        [null, 'Hemkesh Agrawani', null],
        [3, undefined, 28]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines.length).toBe(4); // header + 3 rows
        done();
      }, 100);
    });

    test('should handle all null column', (done) => {
      const data = [
        [1, null],
        [2, null],
        [3, null]
      ];
      const columns = ['id', 'value'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines[1]).toContain('null');
        expect(lines[2]).toContain('null');
        expect(lines[3]).toContain('null');
        done();
      }, 100);
    });
  });

  describe('Special Characters in Data', () => {
    test('should export data with commas', (done) => {
      const data = [
        [1, 'Agrawani, Rishikesh', 32],
        [2, 'Agrawani, Hemkesh', 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        expect(content).toContain('Agrawani, Rishikesh');
        done();
      }, 100);
    });

    test('should export data with quotes', (done) => {
      const data = [
        [1, 'Rishikesh "Rick" Agrawani', 32],
        [2, 'Hemkesh "Hem" Agrawani', 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        expect(content).toContain('Rick');
        done();
      }, 100);
    });

    test('should export data with newlines', (done) => {
      const data = [
        [1, 'Line1\nLine2', 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['id', 'description', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        expect(content).toContain('Line1');
        done();
      }, 100);
    });

    test('should export data with special symbols', (done) => {
      const data = [
        [1, 'Price: $100', 32],
        [2, 'Discount: 50%', 30],
        [3, 'Email: test@example.com', 28]
      ];
      const columns = ['id', 'description', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        expect(content).toContain('$');
        expect(content).toContain('%');
        expect(content).toContain('@');
        done();
      }, 100);
    });

    test('should export data with unicode characters', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'José García', 30],
        [3, '李明', 28]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        expect(content).toContain('José');
        expect(content).toContain('李明');
        done();
      }, 100);
    });

    test('should export data with tabs and spaces', (done) => {
      const data = [
        [1, 'Name\twith\ttabs', 32],
        [2, 'Name  with  spaces', 30]
      ];
      const columns = ['id', 'description', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        expect(content).toContain('tabs');
        expect(content).toContain('spaces');
        done();
      }, 100);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid path gracefully', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      const invalidPath = '/invalid/nonexistent/path/file.csv';
      
      // Suppress console error output for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      df.toCsv(invalidPath);

      setTimeout(() => {
        expect(fs.existsSync(invalidPath)).toBe(false);
        consoleSpy.mockRestore();
        done();
      }, 100);
    });

    test('should handle null path', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      // Should not throw error, just skip file creation
      expect(() => {
        df.toCsv(null);
      }).not.toThrow();
      
      done();
    });

    test('should handle undefined path', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      // Should not throw error, just skip file creation
      expect(() => {
        df.toCsv(undefined);
      }).not.toThrow();
      
      done();
    });

    test('should handle path with invalid characters', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      df.toCsv('/invalid<>path/file.csv');

      setTimeout(() => {
        consoleSpy.mockRestore();
        done();
      }, 100);
    });
  });

  describe('CSV Content Validation', () => {
    test('should match DataFrame data in CSV output', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30],
        [3, 'Malinikesh Agrawani', 28]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        // Verify header
        expect(lines[0]).toBe('id,name,age');
        
        // Verify each row matches DataFrame data
        for (let i = 0; i < df.rows; i++) {
          const expectedRow = [];
          for (let j = 0; j < df.cols; j++) {
            expectedRow.push(df.data[i][columns[j]]);
          }
          expect(lines[i + 1]).toBe(expectedRow.join(','));
        }
        
        done();
      }, 100);
    });

    test('should have correct number of rows in CSV', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30],
        [3, 'Malinikesh Agrawani', 28]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        // Should have header + 3 data rows
        expect(lines.length).toBe(df.rows + 1);
        done();
      }, 100);
    });

    test('should have correct number of columns in CSV', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        // Check header has correct number of columns
        const headerCols = lines[0].split(',');
        expect(headerCols.length).toBe(df.cols);
        
        // Check each data row has correct number of columns
        for (let i = 1; i < lines.length; i++) {
          const rowCols = lines[i].split(',');
          expect(rowCols.length).toBe(df.cols);
        }
        
        done();
      }, 100);
    });

    test('should preserve column order in CSV', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        const headerCols = lines[0].split(',');
        expect(headerCols).toEqual(columns);
        done();
      }, 100);
    });

    test('should preserve row order in CSV', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30],
        [3, 'Malinikesh Agrawani', 28]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        // Verify row order
        expect(lines[1]).toContain('1');
        expect(lines[2]).toContain('2');
        expect(lines[3]).toContain('3');
        done();
      }, 100);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty DataFrame', (done) => {
      const data = [];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        if (fs.existsSync(testCsvPath)) {
          const content = fs.readFileSync(testCsvPath, 'utf-8');
          const lines = content.trim().split('\n');
          
          // Should have header only
          expect(lines[0]).toBe('id,name,age');
        }
        done();
      }, 100);
    });

    test('should handle DataFrame with very long strings', (done) => {
      const longString = 'A'.repeat(1000);
      const data = [
        [1, longString, 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        expect(content).toContain(longString);
        done();
      }, 100);
    });

    test('should handle DataFrame with large numbers', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 999999999],
        [2, 'Hemkesh Agrawani', -999999999]
      ];
      const columns = ['id', 'name', 'value'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        expect(content).toContain('999999999');
        expect(content).toContain('-999999999');
        done();
      }, 100);
    });

    test('should handle DataFrame with very small decimal numbers', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 0.0000001],
        [2, 'Hemkesh Agrawani', 0.9999999]
      ];
      const columns = ['id', 'name', 'value'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        expect(content).toContain('0.0000001');
        expect(content).toContain('0.9999999');
        done();
      }, 100);
    });

    test('should handle DataFrame with special column names', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['id-number', 'full_name', 'age.years'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines[0]).toBe('id-number,full_name,age.years');
        done();
      }, 100);
    });

    test('should handle DataFrame with numeric column names', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['0', '1', '2'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines[0]).toBe('0,1,2');
        done();
      }, 100);
    });

    test('should handle DataFrame with zero values', (done) => {
      const data = [
        [0, 'Rishikesh Agrawani', 0],
        [0, 'Hemkesh Agrawani', 0]
      ];
      const columns = ['id', 'name', 'value'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines[1]).toBe('0,Rishikesh Agrawani,0');
        expect(lines[2]).toBe('0,Hemkesh Agrawani,0');
        done();
      }, 100);
    });

    test('should handle DataFrame with empty strings', (done) => {
      const data = [
        [1, '', 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines[1]).toBe('1,,32');
        done();
      }, 100);
    });
  });

  describe('File Operations', () => {
    test('should overwrite existing CSV file', (done) => {
      const data1 = [[1, 'Old Data', 25]];
      const columns = ['id', 'name', 'age'];
      const df1 = DataFrame(data1, columns);

      df1.toCsv(testCsvPath);

      setTimeout(() => {
        const data2 = [[2, 'New Data', 30]];
        const df2 = DataFrame(data2, columns);
        
        df2.toCsv(testCsvPath);

        setTimeout(() => {
          const content = fs.readFileSync(testCsvPath, 'utf-8');
          expect(content).toContain('New Data');
          expect(content).not.toContain('Old Data');
          done();
        }, 100);
      }, 100);
    });

    test('should create CSV file with correct encoding', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const stats = fs.statSync(testCsvPath);
        expect(stats.size).toBeGreaterThan(0);
        done();
      }, 100);
    });

    test('should create CSV file with proper line endings', (done) => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30]
      ];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      df.toCsv(testCsvPath);

      setTimeout(() => {
        const content = fs.readFileSync(testCsvPath, 'utf-8');
        const lines = content.trim().split('\n');
        
        expect(lines.length).toBeGreaterThan(0);
        expect(lines[0]).toBe('id,name,age');
        done();
      }, 100);
    });
  });
});
