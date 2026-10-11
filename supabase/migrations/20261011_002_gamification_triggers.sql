-- ==============================================================================
-- ASCEND — PERSONAL EVOLUTION
-- MIGRACIÓN 002: Triggers y Funciones de Servidor para Gamificación y XP
-- ==============================================================================

-- Función para calcular nivel según XP acumulado
-- Nivel 1: 0 - 99 XP
-- Nivel 2: 100 - 299 XP
-- Nivel 3: 300 - 599 XP ...
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    IF xp <= 0 THEN
        RETURN 1;
    END IF;
    -- Fórmula progresiva: Level = 1 + floor(sqrt(xp / 75))
    RETURN 1 + FLOOR(SQRT(xp::NUMERIC / 75.0))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para actualizar XP y Nivel en la tabla `profiles` cuando entra un movimiento de XP
CREATE OR REPLACE FUNCTION public.apply_xp_transaction()
RETURNS TRIGGER AS $$
DECLARE
    new_total_xp INTEGER;
    new_lvl INTEGER;
BEGIN
    -- Sumar XP al perfil del usuario
    UPDATE public.profiles
    SET 
        current_xp = current_xp + NEW.xp_amount,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.user_id
    RETURNING current_xp INTO new_total_xp;

    -- Calcular nuevo nivel
    new_lvl := public.calculate_level_from_xp(new_total_xp);

    -- Actualizar nivel si ascendió
    UPDATE public.profiles
    SET level = new_lvl
    WHERE id = NEW.user_id AND level < new_lvl;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_apply_xp ON public.xp_transactions;
CREATE TRIGGER trigger_apply_xp
    AFTER INSERT ON public.xp_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.apply_xp_transaction();

-- Función RPC para otorgar XP de forma segura y atómica desde el cliente o edge function
CREATE OR REPLACE FUNCTION public.grant_user_xp(
    p_source TEXT,
    p_reference_id TEXT,
    p_xp_amount INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_new_xp INTEGER;
    v_new_level INTEGER;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    -- Verificar si la recompensa ya fue otorgada previamente
    IF EXISTS (
        SELECT 1 FROM public.xp_transactions 
        WHERE user_id = v_user_id AND source = p_source AND reference_id = p_reference_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'reason', 'XP ya otorgado previamente para esta actividad');
    END IF;

    -- Insertar transacción
    INSERT INTO public.xp_transactions (user_id, source, reference_id, xp_amount)
    VALUES (v_user_id, p_source, p_reference_id, p_xp_amount);

    SELECT current_xp, level INTO v_new_xp, v_new_level
    FROM public.profiles
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'xp_granted', p_xp_amount,
        'current_xp', v_new_xp,
        'current_level', v_new_level
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
