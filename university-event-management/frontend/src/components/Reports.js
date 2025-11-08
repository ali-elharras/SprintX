import React, { useEffect, useState } from 'react';
import { fetchAttendeeReport, fetchSalesReport, fetchFeatureFlags } from '../services/report';
import Card from './Card';
import Select from './Select';
import Input from './Input';
import Button from './Button';
import LoadingScreen from './LoadingScreen';

const AdminReports = () => {
  const [tab, setTab] = useState('attendees');
  const [loading, setLoading] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [sales, setSales] = useState([]);
  const [featureFlags, setFeatureFlags] = useState({});
  const [filters, setFilters] = useState({
    eventName: '',
    eventType: '',
    startDate: '',
    endDate: '',
    sort: 'desc'
  });

  useEffect(() => {
    fetchFeatureFlags().then(setFeatureFlags).catch(()=>{});
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'attendees') {
        const data = await fetchAttendeeReport({
          eventName: filters.eventName || undefined,
          eventType: filters.eventType || undefined,
          startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined
        });
        setAttendees(data);
      } else {
        const data = await fetchSalesReport({
          eventType: filters.eventType || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          sort: filters.sort
        });
        setSales(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]); // initial & tab switch

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  const applyFilters = () => load();

  return (
    <Card style={{ padding: '1.5rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <Button variant={tab === 'attendees' ? 'primary' : 'secondary'} onClick={() => setTab('attendees')}>Attendee Report</Button>
        <Button variant={tab === 'sales' ? 'primary' : 'secondary'} onClick={() => setTab('sales')}>Sales Report</Button>
        {featureFlags.gpt5Enabled && (
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.7 }}>GPT-5 Enabled</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: tab === 'attendees' ? 'repeat(4,1fr)' : 'repeat(3,1fr)', gap: '0.75rem', flex: 1 }}>
          {tab === 'attendees' && (
            <Input name="eventName" placeholder="Event Name" value={filters.eventName} onChange={handleChange} />
          )}
          <Input name="eventType" placeholder="Event Type" value={filters.eventType} onChange={handleChange} />
          <Input type="date" name="startDate" value={filters.startDate} onChange={handleChange} />
          <Input type="date" name="endDate" value={filters.endDate} onChange={handleChange} />
          {tab === 'sales' && (
            <Select name="sort" value={filters.sort} onChange={handleChange} options={[
              { value: 'desc', label: 'Revenue ↓' },
              { value: 'asc', label: 'Revenue ↑' }
            ]} />
          )}
        </div>
        <Button onClick={applyFilters} style={{ width: '155px', height: '50px', alignSelf: 'flex-start' }}>Apply Filters</Button>
      </div>

      {loading && <LoadingScreen />}

      {!loading && tab === 'attendees' && (
        <div style={{ marginTop: '1rem' }}>
          <ReportTable
            columns={['Name', 'Type', 'Date', 'Attendees']}
            rows={attendees.map(e => [
              e.name,
              e.type || '-',
              e.date ? new Date(e.date).toLocaleDateString() : '-',
              e.attendeeCount
            ])}
          />
        </div>
      )}

      {!loading && tab === 'sales' && (
        <div style={{ marginTop: '1rem' }}>
          <ReportTable
            columns={['Name', 'Type', 'Date', 'Attendees', 'Revenue']}
            rows={sales.map(e => [
              e.name,
              e.type || '-',
              e.date ? new Date(e.date).toLocaleDateString() : '-',
              e.attendeeCount,
              typeof e.revenue === 'number' ? e.revenue.toFixed(2) : '0.00'
            ])}
          />
        </div>
      )}
    </Card>
  );
};

const ReportTable = ({ columns, rows }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c} style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', padding: '0.5rem' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ padding: '0.75rem', fontStyle: 'italic', opacity: 0.7 }}>No data</td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReports;