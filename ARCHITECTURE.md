# Architecture Overview

## System Design

Log Triage Sandbox is a single-page application (SPA) built with React, focusing on client-side log processing and analysis.

### Core Components

#### 1. **LogTriageSandbox** (Main Component)
- Orchestrates all child components
- Manages global state
- Handles data flow

#### 2. **State Management**
```javascript
const [logs, setLogs] = useState([])              // All logs
const [searchQuery, setSearchQuery] = useState('')  // Search state
const [selectedLevels, setSelectedLevels] = useState([]) // Filter state
const [selectedLog, setSelectedLog] = useState(null)    // Detail view
```

#### 3. **Data Flow**
```
User Input → State Update → useMemo Computation → Filtered Logs → UI Render
```

### Performance Optimizations

1. **useMemo for Filtering**
   - Prevents unnecessary recalculation
   - Memoizes filtered results
   - Depends on: logs, searchQuery, selectedLevels, dateRange

2. **Virtual Scrolling** (Future Enhancement)
   - Render only visible logs
   - Improves performance with 10K+ logs

3. **Debounced Search** (Future Enhancement)
   - Delay filtering during typing
   - Reduce computational overhead

### Data Model
```typescript
interface Log {
  id: number
  timestamp: string (ISO 8601)
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'
  service: string
  message: string
  traceId: string
  userId?: string
  metadata: {
    host: string
    pid: number
    duration: number
    [key: string]: any
  }
}
```

### File Processing
```
File Upload → FileReader API → Parse Content → Validate Format → Update State
```

Supported formats:
- **JSONL**: One JSON object per line
- **Text**: Standard log format with regex parsing

### Filtering Algorithm
```javascript
filteredLogs = logs.filter(log => {
  const matchesSearch = /* fuzzy matching */
  const matchesLevel = /* level inclusion */
  const matchesDateRange = /* date comparison */
  return matchesSearch && matchesLevel && matchesDateRange
})
```

Time Complexity: O(n) where n = number of logs
Space Complexity: O(n) for filtered results

### Statistics Computation
```javascript
stats = {
  levelCounts: { ERROR: n1, WARN: n2, ... },
  serviceCounts: { service1: n1, service2: n2, ... }
}
```

Computed via reduce operation: O(n)

## Technology Stack

- **React 18**: UI framework
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Vite**: Build tool (recommended)

## Security Considerations

1. **XSS Prevention**: Sanitize user input
2. **File Size Limits**: Prevent memory overflow
3. **Content Type Validation**: Only accept text files
4. **No Backend**: All processing client-side

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Architecture Enhancements

1. **Web Workers**: Offload parsing to background threads
2. **IndexedDB**: Cache logs for large datasets
3. **Service Worker**: Offline support
4. **WebSocket**: Real-time log streaming
5. **WebAssembly**: High-performance parsing
