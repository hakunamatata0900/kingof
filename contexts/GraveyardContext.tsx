"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Graveyard {
  id: string;
  name: string;
  location: string;
  totalPlots: number;
  createdAt: Date;
}

export interface Plot {
  id: string;
  graveyardId: string;
  plotNumber: string;
  rows: number;
  columns: number;
  totalGraves: number;
  createdAt: Date;
}

export interface Grave {
  id: string;
  plotId: string;
  graveNumber: number;
  status: 'available' | 'unavailable';
  reservedBy?: string;
}

interface GraveyardContextType {
  graveyards: Graveyard[];
  plots: Plot[];
  graves: Grave[];
  addGraveyard: (graveyard: Omit<Graveyard, 'id' | 'createdAt' | 'totalPlots'>) => void;
  updateGraveyard: (id: string, graveyard: Partial<Graveyard>) => void;
  deleteGraveyard: (id: string) => void;
  addPlot: (plot: Omit<Plot, 'id' | 'createdAt' | 'totalGraves'>) => void;
  updatePlot: (id: string, plot: Partial<Plot>) => void;
  deletePlot: (id: string) => void;
  updateGrave: (id: string, grave: Partial<Grave>) => void;
  bulkUpdateGraves: (ids: string[], updates: Partial<Grave>) => void;
}

const GraveyardContext = createContext<GraveyardContextType | undefined>(undefined);

export const GraveyardProvider = ({ children }: { children: ReactNode }) => {
  const [graveyards, setGraveyards] = useState<Graveyard[]>([
    {
      id: '1',
      name: 'H8 Graveyard',
      location: 'H8 - Islamabad',
      totalPlots: 2,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'H9 Graveyard',
      location: 'H9 - Islamabad',
      totalPlots: 1,
      createdAt: new Date('2024-02-20'),
    },
  ]);

  const [plots, setPlots] = useState<Plot[]>([
    {
      id: '1',
      graveyardId: '1',
      plotNumber: 'A1',
      rows: 5,
      columns: 6,
      totalGraves: 30,
      createdAt: new Date('2024-01-16'),
    },
    {
      id: '2',
      graveyardId: '1',
      plotNumber: 'A2',
      rows: 4,
      columns: 5,
      totalGraves: 20,
      createdAt: new Date('2024-01-17'),
    },
    {
      id: '3',
      graveyardId: '2',
      plotNumber: 'B1',
      rows: 6,
      columns: 4,
      totalGraves: 24,
      createdAt: new Date('2024-02-21'),
    },
  ]);

  const [graves, setGraves] = useState<Grave[]>(() => {
    const initialGraves: Grave[] = [];
    plots.forEach((plot) => {
      for (let i = 1; i <= plot.totalGraves; i++) {
        initialGraves.push({
          id: `${plot.id}-${i}`,
          plotId: plot.id,
          graveNumber: i,
          status: Math.random() > 0.6 ? 'unavailable' : 'available',
        });
      }
    });
    return initialGraves;
  });

  const addGraveyard = (graveyard: Omit<Graveyard, 'id' | 'createdAt' | 'totalPlots'>) => {
    const newGraveyard: Graveyard = {
      ...graveyard,
      id: Date.now().toString(),
      totalPlots: 0,
      createdAt: new Date(),
    };
    setGraveyards((prev) => [...prev, newGraveyard]);
  };

  const updateGraveyard = (id: string, updates: Partial<Graveyard>) => {
    setGraveyards((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const deleteGraveyard = (id: string) => {
    const plotsToDelete = plots.filter((p) => p.graveyardId === id);
    plotsToDelete.forEach((plot) => {
      setGraves((prev) => prev.filter((g) => g.plotId !== plot.id));
    });
    setPlots((prev) => prev.filter((p) => p.graveyardId !== id));
    setGraveyards((prev) => prev.filter((g) => g.id !== id));
  };

  const addPlot = (plot: Omit<Plot, 'id' | 'createdAt' | 'totalGraves'>) => {
    const totalGraves = plot.rows * plot.columns;
    const newPlot: Plot = {
      ...plot,
      id: Date.now().toString(),
      totalGraves,
      createdAt: new Date(),
    };
    setPlots((prev) => [...prev, newPlot]);

    const newGraves: Grave[] = [];
    for (let i = 1; i <= totalGraves; i++) {
      newGraves.push({
        id: `${newPlot.id}-${i}`,
        plotId: newPlot.id,
        graveNumber: i,
        status: 'available',
      });
    }
    setGraves((prev) => [...prev, ...newGraves]);

    setGraveyards((prev) =>
      prev.map((g) =>
        g.id === plot.graveyardId
          ? { ...g, totalPlots: g.totalPlots + 1 }
          : g
      )
    );
  };

  const updatePlot = (id: string, updates: Partial<Plot>) => {
    setPlots((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePlot = (id: string) => {
    const plot = plots.find((p) => p.id === id);
    setGraves((prev) => prev.filter((g) => g.plotId !== id));
    setPlots((prev) => prev.filter((p) => p.id !== id));
    if (plot) {
      setGraveyards((prev) =>
        prev.map((g) =>
          g.id === plot.graveyardId
            ? { ...g, totalPlots: Math.max(0, g.totalPlots - 1) }
            : g
        )
      );
    }
  };

  const updateGrave = (id: string, updates: Partial<Grave>) => {
    setGraves((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const bulkUpdateGraves = (ids: string[], updates: Partial<Grave>) => {
    setGraves((prev) =>
      prev.map((g) => (ids.includes(g.id) ? { ...g, ...updates } : g))
    );
  };

  return (
    <GraveyardContext.Provider
      value={{
        graveyards,
        plots,
        graves,
        addGraveyard,
        updateGraveyard,
        deleteGraveyard,
        addPlot,
        updatePlot,
        deletePlot,
        updateGrave,
        bulkUpdateGraves,
      }}
    >
      {children}
    </GraveyardContext.Provider>
  );
};

export const useGraveyard = () => {
  const context = useContext(GraveyardContext);
  if (!context) {
    throw new Error('useGraveyard must be used within GraveyardProvider');
  }
  return context;
};
