-- Allow authenticated admins to delete registrations
CREATE POLICY "Allow authenticated deletes" ON public.registrations
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated deletes" ON public.tournament_registrations
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated deletes" ON public.parklea_registrations
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated deletes" ON public.holiday_program_registrations
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated deletes" ON public.aia_program_registrations
    FOR DELETE USING (auth.role() = 'authenticated');
