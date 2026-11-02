import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';
import { Box, Button, EmptyStateLayout, Field, Flex, Main, SingleSelect, SingleSelectOption, Table, Tbody, Td, Textarea, TextInput, Th, Thead, Tr, Typography } from '@strapi/design-system';
import { Plus } from '@strapi/icons';
import './portal.css';

type Publication = {
  documentId?: string;
  id?: number;
  title?: string;
  slug?: string;
  editorialType?: string;
  publishedAt?: string | null;
  updatedAt?: string;
  locale?: string;
};

const typeLabels: Record<string, string> = { article: 'Article', study: 'Étude / rapport', note: 'Note / point de vue', 'case-study': 'Étude de cas', guide: 'Guide / ressource', intervention: 'Intervention / interview' };

const contentManagerUrl = '/admin/content-manager/collection-types/api::publication.publication?plugins[i18n][locale]=fr';
const createUrl = '/admin/content-manager/collection-types/api::publication.publication/create?plugins[i18n][locale]=fr';

export function HomePage() {
  const { get, post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [editorialType, setEditorialType] = useState('article');
  const [category, setCategory] = useState('Analyse');

  const reloadItems = () => get('/content-manager/collection-types/api::publication.publication?page=1&pageSize=8&sort=updatedAt:DESC&plugins[i18n][locale]=fr')
    .then(({ data }: { data: { results?: Publication[]; data?: Publication[] } }) => setItems(data.results || data.data || []));

  const createDraft = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !excerpt.trim()) {
      toggleNotification({ type: 'warning', message: 'Le titre et le résumé sont obligatoires.' });
      return;
    }
    setSaving(true);
    try {
      await post('/content-manager/collection-types/api::publication.publication', { data: {
        editorialType,
        title: title.trim(),
        slug: title.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        excerpt: excerpt.trim(),
        content: [{ __component: 'publication.rich-text', text: excerpt.trim() }],
        authorName: 'Brice Merlin MIAFFO',
        category: category.trim() || 'Analyse',
      }, locale: 'fr' });
      toggleNotification({ type: 'success', message: 'Brouillon créé. Vous pouvez maintenant ajouter les détails et la traduction anglaise.' });
      setTitle(''); setExcerpt(''); setShowForm(false); await reloadItems();
    } catch {
      toggleNotification({ type: 'warning', message: 'Le brouillon n’a pas pu être créé. Vérifiez les droits de votre compte.' });
    } finally { setSaving(false); }
  };

  useEffect(() => {
    let active = true;
    reloadItems()
      .then(() => undefined)
      .catch(() => toggleNotification({ type: 'warning', message: 'Les publications ne peuvent pas être chargées pour le moment.' }))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [get, toggleNotification]);

  return (
    <Main aria-labelledby="editorial-portal-title">
      <Box padding={{ base: 4, medium: 8 }} className="editorial-portal">
        <Flex justifyContent="space-between" alignItems="flex-start" gap={4} wrap="wrap">
          <Box>
            <Typography variant="alpha" as="h1" id="editorial-portal-title">Espace éditorial</Typography>
            <Typography variant="epsilon" textColor="neutral600">Publiez vos articles, études et rapports sans réglage technique.</Typography>
          </Box>
          <Button onClick={() => setShowForm((value) => !value)} startIcon={<Plus />} size="L">Nouvelle publication</Button>
        </Flex>

        {showForm && <Box background="neutral0" hasRadius shadow="tableShadow" padding={6} marginTop={6} as="section" aria-labelledby="new-publication-title">
          <Typography variant="beta" as="h2" id="new-publication-title">Créer un brouillon</Typography>
          <Typography variant="pi" textColor="neutral600">Commencez simplement. Les autres champs resteront disponibles dans l’éditeur Strapi.</Typography>
          <Box as="form" onSubmit={createDraft} marginTop={5}>
            <Flex gap={4} wrap="wrap">
              <Box className="editorial-form-field"><Field.Root name="title" required><Field.Label>Titre</Field.Label><TextInput value={title} onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)} placeholder="Ex. Les transitions numériques en Afrique" /></Field.Root></Box>
              <Box className="editorial-form-field"><Field.Root name="editorialType"><Field.Label>Format</Field.Label><SingleSelect value={editorialType} onChange={setEditorialType}><SingleSelectOption value="article">Article</SingleSelectOption><SingleSelectOption value="study">Étude / rapport</SingleSelectOption><SingleSelectOption value="note">Note / point de vue</SingleSelectOption><SingleSelectOption value="guide">Guide / ressource</SingleSelectOption></SingleSelect></Field.Root></Box>
            </Flex>
            <Box marginTop={4}><Field.Root name="category"><Field.Label>Catégorie</Field.Label><TextInput value={category} onChange={(event: ChangeEvent<HTMLInputElement>) => setCategory(event.target.value)} /></Field.Root></Box>
            <Box marginTop={4}><Field.Root name="excerpt" required><Field.Label>Résumé</Field.Label><Textarea value={excerpt} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setExcerpt(event.target.value)} placeholder="Présentez le sujet en quelques lignes." /></Field.Root></Box>
            <Flex gap={3} marginTop={5}><Button type="submit" loading={saving}>Enregistrer le brouillon</Button><Button type="button" variant="tertiary" onClick={() => setShowForm(false)}>Annuler</Button></Flex>
          </Box>
        </Box>}

        <Flex gap={4} marginTop={6} wrap="wrap">
          <Box background="neutral0" hasRadius shadow="tableShadow" padding={5} className="editorial-card">
            <Typography variant="sigma" textColor="neutral600">À faire</Typography>
            <Typography variant="alpha" as="p">{items.filter((item) => !item.publishedAt).length}</Typography>
            <Typography variant="pi">Brouillons à relire ou publier</Typography>
          </Box>
          <Box background="neutral0" hasRadius shadow="tableShadow" padding={5} className="editorial-card">
            <Typography variant="sigma" textColor="neutral600">Publications visibles</Typography>
            <Typography variant="alpha" as="p">{items.filter((item) => item.publishedAt).length}</Typography>
            <Typography variant="pi">Contenus publiés dans le portfolio</Typography>
          </Box>
          <Box background="neutral0" hasRadius shadow="tableShadow" padding={5} className="editorial-card">
            <Typography variant="sigma" textColor="neutral600">Langue de travail</Typography>
            <Typography variant="alpha" as="p">FR</Typography>
            <Typography variant="pi">Les traductions anglaises se gèrent depuis chaque publication</Typography>
          </Box>
        </Flex>

        <Box marginTop={8}>
          <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
            <Box><Typography variant="beta" as="h2">Publications récentes</Typography><Typography variant="pi" textColor="neutral600">Un aperçu simple de votre activité éditoriale.</Typography></Box>
            <Button tag="a" href={contentManagerUrl} variant="secondary">Voir toutes les publications</Button>
          </Flex>
          {loading ? <Typography>Chargement…</Typography> : items.length === 0 ? <EmptyStateLayout content="Aucune publication pour le moment. Commencez par créer votre premier article." /> : (
            <Table colCount={5} rowCount={items.length} aria-label="Publications récentes">
              <Thead><Tr><Th><Typography variant="sigma">Titre</Typography></Th><Th><Typography variant="sigma">Format</Typography></Th><Th><Typography variant="sigma">Langue</Typography></Th><Th><Typography variant="sigma">État</Typography></Th><Th><Typography variant="sigma">Action</Typography></Th></Tr></Thead>
              <Tbody>{items.map((item) => <Tr key={item.documentId || item.id}><Td><Typography fontWeight="semiBold">{item.title || 'Sans titre'}</Typography><Typography variant="pi" textColor="neutral600">{item.slug || ''}</Typography></Td><Td>{typeLabels[item.editorialType || ''] || 'Publication'}</Td><Td>{item.locale === 'en' ? 'EN' : 'FR'}</Td><Td><Typography textColor={item.publishedAt ? 'success600' : 'neutral600'}>{item.publishedAt ? 'Publié' : 'Brouillon'}</Typography></Td><Td><Button tag="a" href={contentManagerUrl} variant="tertiary" size="S">Ouvrir</Button></Td></Tr>)}</Tbody>
            </Table>
          )}
        </Box>

        <Box background="primary100" hasRadius padding={5} marginTop={8} className="editorial-help">
          <Typography variant="beta" as="h2">Besoin d’aide ?</Typography>
          <Typography>Commencez par une nouvelle publication, remplissez le titre et le résumé, puis enregistrez en brouillon. Vous pourrez toujours modifier ou publier plus tard.</Typography>
        </Box>
      </Box>
    </Main>
  );
}

export default HomePage;
