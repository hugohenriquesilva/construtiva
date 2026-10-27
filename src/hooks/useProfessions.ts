import { useCallback, useEffect, useMemo, useState } from 'react';
import { listProfessions, Profession } from '@/src/services/professionService';

// Carrega a coleção "professions" e expõe um mapa id -> nome para exibição
export function useProfessions() {
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    // Incrementado pelo reload() para disparar uma nova leitura
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const loadProfessions = async () => {
            try {
                const result = await listProfessions();
                if (cancelled) return;
                setProfessions(result);
                setError(false);
            } catch (e) {
                console.error('Erro ao carregar profissões:', e);
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadProfessions();
        return () => {
            cancelled = true;
        };
    }, [version]);

    const reload = useCallback(() => {
        setLoading(true);
        setVersion((v) => v + 1);
    }, []);

    const namesById = useMemo(
        () => Object.fromEntries(professions.map((p) => [p.id, p.name])) as Record<string, string>,
        [professions]
    );

    return { professions, namesById, loading, error, reload };
}
